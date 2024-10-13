# yolosns

A library and template to run custom command in [NNS dapp](https://nns.ic0.app).

## ✍️ Example of Usage

```javascript
const {addControllerToMyNeurons} = await import("https://unpkg.com/yolosns@latest/dist/esm/index.js");

await addControllerToMyNeurons({canisterId: '1234', principal: 'abcd'});
```
