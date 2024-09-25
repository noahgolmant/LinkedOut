// Function to determine if we're on the main feed page
function isOnMainFeed() {
  const path = window.location.pathname;
  // Return true only if the pathname is exactly '/feed' or '/feed/'
  return path === '/feed' || path === '/feed/';
}

// Function to remove the LinkedIn News section
function removeLinkedInNews() {
  document.querySelectorAll('section').forEach((section) => {
    if (section.innerText.includes('LinkedIn News')) {
      section.remove();
    }
  });
}

// Function to remove ad banners
function removeAdBanners() {
  document.querySelectorAll('iframe[data-ad-banner], iframe[title="advertisement"], .ad-banner').forEach((adBanner) => {
    adBanner.remove();
  });
}

// Function to clean the feed
function cleanFeed() {
  // Select all posts
  document.querySelectorAll('div.occludable-update').forEach((post) => {
    // Remove "Promoted" posts
    if (post.innerText.includes('Promoted')) {
      post.remove();
      return;
    }

    // Remove LinkedIn Ads and Promotions
    if (post.querySelector('.update-components-promo-v1__text-container')) {
      post.remove();
      return;
    }

    // Remove "Suggested" posts
    const headerTextElement = post.querySelector('.update-components-header__text-view');
    if (headerTextElement) {
      const headerText = headerTextElement.innerText.trim().toLowerCase();
      if (
        headerText === 'suggested' || // Added this condition
        headerText === 'jobs recommended for you' ||
        headerText.includes('contributed to this')
      ) {
        post.remove();
        return;
      }
    }

    // Remove "Suggested for you" and "People also viewed" posts
    if (
      post.innerText.includes('Suggested for you') ||
      post.innerText.includes('People also viewed')
    ) {
      post.remove();
      return;
    }

    // Only show posts from the last week
    const timeElement = post.querySelector(
      'span.update-components-actor__sub-description, span.feed-shared-actor__sub-description'
    );
    if (timeElement) {
      const timeText = timeElement.innerText.trim();
      const postDate = parsePostDate(timeText);
      if (postDate && Date.now() - postDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
        // Post is older than a week
        post.remove();
        return;
      }
    }
  });
}

// Helper function to parse the post date
function parsePostDate(timeText) {
  // Regex patterns to match time formats like '2w', '2 weeks ago', '2w •'
  const patterns = [
    /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i,
    /(\d+)\s*(s|m|h|d|w|mo|y)\b/i,
    /(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*(?:•|\|)/i,
  ];

  let match;
  for (const pattern of patterns) {
    match = timeText.match(pattern);
    if (match) break;
  }

  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    let multiplier = 0;

    switch (unit) {
      case 's':
      case 'second':
        multiplier = 1000;
        break;
      case 'm':
      case 'minute':
        multiplier = 60 * 1000;
        break;
      case 'h':
      case 'hour':
        multiplier = 60 * 60 * 1000;
        break;
      case 'd':
      case 'day':
        multiplier = 24 * 60 * 60 * 1000;
        break;
      case 'w':
      case 'week':
        multiplier = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'mo':
      case 'month':
        multiplier = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'y':
      case 'year':
        multiplier = 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        return null;
    }

    return new Date(Date.now() - value * multiplier);
  }
  return null;
}

// Function to initialize the cleaning process
function init() {
  if (!isOnMainFeed()) {
    // If not on the main feed page, do nothing
    return;
  }

  // Initial execution
  removeLinkedInNews();
  removeAdBanners();
  cleanFeed();

  // Observe changes in the feed to handle dynamic content loading
  const observer = new MutationObserver(() => {
    removeLinkedInNews();
    removeAdBanners();
    cleanFeed();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Handle SPA navigation by detecting URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document.body, { childList: true, subtree: true });

// Run the initialization function
init();

