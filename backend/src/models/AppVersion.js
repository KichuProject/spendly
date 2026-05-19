const mongoose = require('mongoose');

const appVersionSchema = new mongoose.Schema({
  latestVersion: {
    type: String,
    required: true,
  },
  minVersion: {
    type: String,
    required: true,
  },
  forceUpdate: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'A new version of the app is available. Please update to enjoy the latest features and improvements.',
  },
  platform: {
    type: String,
    enum: ['android', 'ios'],
    required: true,
    unique: true, // Only one document per platform
  },
  apkLink: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const AppVersion = mongoose.model('AppVersion', appVersionSchema);

module.exports = AppVersion;
