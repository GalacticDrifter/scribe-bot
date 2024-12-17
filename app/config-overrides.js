const { override, addWebpackPlugin } = require('customize-cra');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = override(
  addWebpackPlugin(
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js'), to: 'static/js' },
        { from: path.resolve(__dirname, 'node_modules/@ricky0123/vad-web/dist/silero_vad.onnx'), to: 'static/js' },
        { from: path.resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort-wasm.wasm'), to: 'static/js' },
        { from: path.resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm'), to: 'static/js' },
        { from: path.resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm'), to: 'static/js' },
        { from: path.resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm'), to: 'static/js' },
      ],
    })
  )
);
