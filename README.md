# yolosns

A library and template to run custom command in [NNS dapp](https://nns.ic0.app).

## ✍️ Example of Usage

```javascript
const {addControllerToMyNeurons} = await import("https://unpkg.com/yolosns@latest/dist/esm/index.js");

await addControllerToMyNeurons({canisterId: '1234', principal: 'abcd'});
```

## Usage injected in a web worker

> Note: the script should not contain any export

1. Generate the script

```
npm run export
```

Open `script.txt` and copy the content

2. In the browser debugger

> Note: on the first step, do not forget the quotes around the copied code. It should be a string.

```
const code = 'PASTE_THE_COPIED_CODE_HERE'
const uint8Array = Uint8Array.fromBase64(code)
const blob = new Blob([uint8Array], {type: 'application/javascript'})
const worker = new Worker(URL.createObjectURL(blob))
```