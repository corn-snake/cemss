import { base64UrlEncode, base64UrlDecode, base64ToBytes, bytesToBase64 } from "./textTransform.js";
import keycret from "./../.env/keycret.js"

export const decodeToken = async (token) => {
	// get the local secret key
	// env, provided

	// split the token
	const tokenParts = token.split(".").filter(Boolean).filter(e=>e!==".");
	const header = base64UrlDecode(tokenParts[0]);
	const payload = base64UrlDecode(tokenParts[1]);
	const signatureProvided = tokenParts[2];

	// check the expiration time - note this will cause an error if there is no 'exp' claim in the token
	const user = JSON.parse(payload).sub;
	const expiration = JSON.parse(payload).iat + 172800;
	const tokenExpired = (new Date()).getTime() > expiration;

	// build a signature based on the header and payload using the secret
	const base64UrlHeader = tokenParts[0];
	const base64UrlPayload = tokenParts[1];
	const signature = await crypto.subtle.sign({name: "HMAC"}, keycret, (new TextEncoder()).encode(base64UrlHeader + "." + base64UrlPayload));
	const base64UrlSignature = base64UrlEncode(signature);

	// verify it matches the signature provided in the token
	const signatureValid = (base64UrlSignature === await signatureProvided);

	//echo "Header:\n" + header + "\n";
	//echo "Payload:\n" + payload + "\n";

	if (tokenExpired) {
		return false;
	}

	if (signatureValid) {
		return user;
	}
	
	return false;
}

export const encodeToken = async (uname) => {
	const header = base64UrlEncode('{"alg":"HS512","typ":"JWT"}');
	const payload = base64UrlEncode('{"sub":"' + uname + '","iat":' + (new Date()).getTime() + "}");
	const signature = await crypto.subtle.sign({name: "HMAC"}, keycret, (new TextEncoder()).encode(header + "." + payload));
	const base64UrlSignature = base64UrlEncode(signature);
	return header + "." + payload + "." + base64UrlSignature;
}