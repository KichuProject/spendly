const AppVersion = require('../models/AppVersion');
const logger = require('../utils/logger');

/**
 * GET /api/version?platform=android
 * Fetches the version details for a specific platform.
 */
exports.getVersion = async (req, res) => {
  try {
    const platform = req.query.platform || 'android';
    
    // Find version doc by platform
    const versionInfo = await AppVersion.findOne({ platform });
    
    if (!versionInfo) {
      // Return a safe default if no config exists in the database
      return res.status(200).json({
        success: true,
        data: {
          latestVersion: '3.0.0',
          minVersion: '3.0.0',
          forceUpdate: false,
          message: 'Update your app to the latest version!',
          apkLink: '',
          platform,
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        latestVersion: versionInfo.latestVersion,
        minVersion: versionInfo.minVersion,
        forceUpdate: versionInfo.forceUpdate,
        message: versionInfo.message,
        apkLink: versionInfo.apkLink,
        platform: versionInfo.platform,
      }
    });
  } catch (error) {
    logger.error(`Error fetching app version: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch version info',
    });
  }
};

/**
 * POST /api/version
 * Creates or updates the version configuration for a platform.
 * Example body: { latestVersion: "1.2.0", minVersion: "1.0.5", forceUpdate: false, platform: "android", message: "Optional update available" }
 */
exports.updateVersion = async (req, res) => {
  try {
    const { latestVersion, minVersion, forceUpdate, message, platform, apkLink } = req.body;

    if (!latestVersion || !minVersion || !platform) {
      return res.status(400).json({
        success: false,
        message: 'latestVersion, minVersion, and platform are required',
      });
    }

    // Upsert the configuration
    const versionInfo = await AppVersion.findOneAndUpdate(
      { platform },
      { latestVersion, minVersion, forceUpdate, message, platform, apkLink },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: versionInfo,
      message: 'Version configuration updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating app version: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update version info',
    });
  }
};
