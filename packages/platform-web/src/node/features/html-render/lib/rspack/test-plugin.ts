/**
 * Simple test file to verify RspackBuildManifestPlugin functionality
 * This file is used to test the plugin's basic functionality and type compatibility
 */

import RspackBuildManifestPlugin from '../webpack/build-manifest-plugin.rspack';

// Test basic instantiation
const plugin = new RspackBuildManifestPlugin();

// Test with custom options
const pluginWithOptions = new RspackBuildManifestPlugin({
  filename: 'custom-manifest.json',
  modules: true,
  chunkRequest: true
});

// Test that the plugin has the expected methods
console.log('Plugin instance:', plugin);
console.log('Plugin with options:', pluginWithOptions);

// Verify the plugin implements the Plugin interface
if (typeof plugin.apply === 'function') {
  console.log('✅ Plugin.apply method exists');
} else {
  console.log('❌ Plugin.apply method missing');
}

if (typeof plugin.createAssets === 'function') {
  console.log('✅ Plugin.createAssets method exists');
} else {
  console.log('❌ Plugin.createAssets method missing');
}

export { plugin, pluginWithOptions };
