// Load/create maps
var map
fetch('map.json')
    .then(response => response.json())
    .then(val => map = val)
    .then(function() {
        // Use filenames from json to make Image objects
        for (let letter in map) {

        }
    })
var circleMap = {
    "a": "#a",
    "b": "#b",
    "c": "#c",
    "d": "#d",
    "e": "#e",
    "f": "#f",
}
// Define globals
var eng
var buf
var ipa
var out

window.onload = function() {
    // Get elements
    eng = document.getElementById("eng");
    buf = document.getElementById("ipa-in");
    ipa = document.getElementById("ipa-out");
    out = document.getElementById("out");
    // Load IPA converter
    TextToIPA.loadDict('text-to-ipa/ipadict.txt');
}

function substitute() {
    let raw;
    raw = buf.value = eng.value;

    /** English >>> IPA **/
    ConverterForm.convert('ipa-in', 'ipa-out', 'ipa-err');

    /** Decimal >>> Hex **/
    ipa.value = ipa.value.replace(/\d+\.?\d*/g, hexise);

    /**  IPA >>> Phanthish **/
    // Clear output
    while (out.firstChild) {
        out.firstChild.remove()
    }
    // Iterate through characters
    let glyphs = [];
    let isnum = false;
    let newWord = false;
    let word = document.createElement("div");
    word.className = "phanthish-word";
    word.style.display = "inline"
    for (let char of ipa.value) {
        // Skip if requested
        if (isnum) {
            isnum = false;
            char = "#" + char
        }
        // Handle hex chars
        if (char === "#") {
            isnum = true;
            continue;
        }
        // Skip punctuation
        if (char.charCodeAt(0) === 712) {
            continue;
        }
        // If just started or last char was a space...
        if (newWord) {
            // Append word
            glyphs.push(word);
            // create new word object
            word = document.createElement("div");
            word.style.display = "inline-block"
            word.className = "phanthish-word";
        }

        // Lookup image in character map, substitute ? if not found
        let filepath = `letters/${map["?"]}.svg`;
        if (char in map) {
            filepath = `letters/${map[char]}.svg`;
        } else {
            console.log(`Could not find Phanthish character for '${char}'`)
        }
        let img = new Image();
        img.char = char
        img.src = encodeURI(filepath);
        img.style.height = "1.2em";
        img.style.width = "0.8em";
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";
        img.className = "phanthish-letter";
        // If space, append direct to glyph list and mark as needing a new word
        word.appendChild(img);
        if (char == " ") {
            glyphs.push(word);
            newWord = true;
        } else {
            newWord = false;
        }
    }
    // Append final word
    glyphs.push(word)
    for (let glyph of glyphs) {
        out.appendChild(glyph);
    }
}

function hexise(num) {
    // Get decimal
    let decStr = String(num).split(".")[1];
    let dec = parseInt(decStr);
    if (dec) {
        // Get numerator and denominator for just the decimal
        let numer = dec;
        let denom = 10**decStr.length;
        // Simplify fraction
        let common = gcd(numer, denom);
        numer /= common;
        denom /= common;
        // Convert numerator and denominator to hex
        numer = numer.toString(16);
        denom = denom.toString(16);
        // Construct fraction string
        fracStr = `.${numer}/${denom}`;
    } else {
        // Don't write fraction if it's nothing
        fracStr = "";
    }

    // Get integer
    let int = Math.floor(parseFloat(num))
    let intStr = int.toString(16);

    // Convert to circle letters
    for (let char in circleMap) {
        intStr = intStr.replaceAll(char, circleMap[char]);
        fracStr = fracStr.replaceAll(char, circleMap[char]);
    }

    return `[${intStr}${fracStr}]`
}

// Greatest Common Denominator function
var gcd = function(a, b) {
  if (!b) {
    return a;
  } else {
    return gcd(b, a % b);
  }
};
