/// Application Configuration
/// Centralized config for environment variables and constants

class AppConfig {
  // Supabase Configuration
  static const String supabaseUrl =
      String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const String supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  // n8n Webhooks
  static const String n8nSocialShareWebhook =
      String.fromEnvironment('N8N_SOCIAL_SHARE_WEBHOOK', defaultValue: '');
  static const String n8nProcessImageWebhook =
      String.fromEnvironment('N8N_PROCESS_IMAGE_WEBHOOK', defaultValue: '');

  // App Configuration
  static const String appName = 'BeautyTryOn';
  static const String appVersion = '1.0.0';
  static const String appUrl = 'https://beautytry-on.app';

  // Feature Flags
  static const bool enableAIGeneration = true;
  static const bool enableSocialSharing = true;
  static const bool enablePremiumFeatures = true;

  // Limits
  static const int freeTryOnsPerDay = 10;
  static const int maxGalleryItems = 100;
  static const int maxImageSizeMB = 10;

  // Validation
  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
