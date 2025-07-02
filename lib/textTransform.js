///////////////////// modified from https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727, with license as follows:
/*
MIT License

Copyright (c) 2020 Egor Nepomnyaschih

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const base64abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	base64codes = [
		255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
		255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
		255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
		255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
		255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
	];

const getBase64Code = (charCode) => {
	if (charCode >= base64codes.length) {
		throw new Error("Unable to parse base64 string.");
	}
	const code = base64codes[charCode];
	if (code === 255) {
		throw new Error("Unable to parse base64 string.");
	}
	return code;
}

export const bytesToBase64 = (bytes) => {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}

//////////////////////////////////////////////////////////////////// https://github.com/cryptii/cryptii/blob/main/src/ByteEncoder.js
/*
MIT License

Copyright (c) 2024 Fränz Friederes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export const base64ToBytes = (str) => {
    // Compose options
    const {
		alphabet,
		padding,
		foreignCharacters,
		maxLineLength,
		lineSeparator
    } = Object.assign({}, {alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
		padding: '=',
		paddingOptional: false,
		foreignCharacters: false,
		maxLineLength: null,
		lineSeparator: '\r\n'
	});

    // Translate each character into an octet
    const length = str.length
    const octets = []
    let character, octet
    let i = -1

    // Go through each character
    while (++i < length) {
      character = str[i]

      if (maxLineLength !== null &&
          lineSeparator &&
          character === lineSeparator[0] &&
          str.substr(i, lineSeparator.length) === lineSeparator) {
        // This is a line separator, skip it
        i = i + lineSeparator.length - 1
      } else if (character === padding) {
        // This is a pad character, ignore it
      } else {
        // This is an octet or a foreign character
        octet = alphabet.indexOf(character)
        if (octet !== -1) {
          octets.push(octet)
        } else if (!foreignCharacters) {
          throw new ByteEncodingError(
            `Forbidden character '${character}' at index ${i}`)
        }
      }
    }

    // Calculate original padding and verify it
    const paddingSize = (4 - octets.length % 4) % 4
    if (paddingSize === 3) {
      throw new ByteEncodingError(
        'A single remaining encoded character in the last quadruple or a ' +
        'padding of 3 characters is not allowed')
    }

    // Fill up octets
    for (i = 0; i < paddingSize; i++) {
      octets.push(0)
    }

    // Map pairs of octets (4) to pairs of bytes (3)
    const size = octets.length / 4 * 3
    const bytes = new Uint8Array(size)
    let j
    for (i = 0; i < octets.length; i += 4) {
      // Calculate byte index
      j = i / 4 * 3
      // Byte 1: bits 1-6 from octet 1 joined by bits 1-2 from octet 2
      bytes[j] = (octets[i] << 2) | (octets[i + 1] >> 4)
      // Byte 2: bits 3-6 from octet 2 joined by bits 1-4 from octet 3
      bytes[j + 1] = ((octets[i + 1] & 0b001111) << 4) | (octets[i + 2] >> 2)
      // Byte 3: bits 5-6 from octet 3 joined by bits 1-6 from octet 4
      bytes[j + 2] = ((octets[i + 2] & 0b000011) << 6) | octets[i + 3]
    }
    return bytes.slice(0, size - paddingSize)
}

const base64encode = (str, encoder = new TextEncoder()) => {
	return bytesToBase64(encoder.encode(str));
}

const base64decode = (str, decoder = new TextDecoder()) => {
	return decoder.decode(base64ToBytes(str));
}

export const base64UrlEncode = data => base64encode(data).replaceAll("+", "-").replaceAll("/", "_").replace(/=*/gi,"");
export const base64UrlDecode = data => base64decode(data.replaceAll("-", "+").replaceAll("_", "/"));