/**
 * Chingu Auto-Polish Engine
 * Cleans up captured steps into a polished SOP guide.
 * Works without AI (rule-based), with optional AI upgrade.
 */

const ChinguPolish = {
  /**
   * Main entry: polish an array of steps
   * Returns { title, steps } with cleaned data
   */
  polish(steps, options = {}) {
    if (!steps || steps.length === 0) return { title: 'Untitled Guide', steps: [] };

    let cleaned = [...steps];

    // 1. Remove duplicate consecutive clicks (double-clicks, accidental repeats)
    cleaned = this.removeDuplicates(cleaned);

    // 2. Remove noise steps (scroll-only, body clicks, extension UI clicks)
    cleaned = this.removeNoise(cleaned);

    // 3. Improve descriptions
    cleaned = cleaned.map(step => ({
      ...step,
      description: this.improveDescription(step)
    }));

    // 4. Renumber steps
    cleaned = cleaned.map((step, i) => ({ ...step, number: i + 1 }));

    // 5. Generate smart title
    const title = this.generateTitle(cleaned);

    return { title, steps: cleaned };
  },

  /**
   * Remove duplicate consecutive steps
   * Two steps are "duplicates" if they're on the same element within 2 seconds
   */
  removeDuplicates(steps) {
    if (steps.length <= 1) return steps;

    const result = [steps[0]];
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1];
      const curr = steps[i];

      const sameElement = curr.elementTag === prev.elementTag &&
        curr.elementText === prev.elementText &&
        curr.elementId === prev.elementId;

      const quickRepeat = Math.abs(curr.timestamp - prev.timestamp) < 2000;

      if (sameElement && quickRepeat) {
        // Keep the second one (it has the updated state after click)
        result[result.length - 1] = curr;
      } else {
        result.push(curr);
      }
    }
    return result;
  },

  /**
   * Remove noise: clicks on body, html, or empty areas
   */
  removeNoise(steps) {
    return steps.filter(step => {
      const tag = (step.elementTag || '').toLowerCase();
      // Remove body/html clicks (user clicked empty space)
      if (tag === 'body' || tag === 'html') return false;
      // Remove if description is just "Click on the page" AND no meaningful context
      if (step.description === 'Click on the page' && !step.elementId && !step.elementClass) return false;
      return true;
    });
  },

  /**
   * Improve a single step's description
   */
  improveDescription(step) {
    const tag = (step.elementTag || '').toLowerCase();
    const text = (step.elementText || '').trim();
    const id = step.elementId || '';
    const url = step.url || '';

    // Already has a good description with quoted text? Keep it
    if (step.description && step.description.includes('"') && !step.description.includes('Click on the page')) {
      return step.description;
    }

    // Try to build a better description from context
    // Navigation items
    if (tag === 'a' || tag === 'nav') {
      if (text) return `Navigate to "${text}"`;
      if (id) return `Navigate to "${this.humanizeId(id)}"`;
    }

    // Tabs
    if (step.role === 'tab' || (step.elementClass || '').includes('tab')) {
      if (text) return `Switch to the "${text}" tab`;
    }

    // Menu items
    if (step.role === 'menuitem' || (step.elementClass || '').includes('menu')) {
      if (text) return `Select "${text}" from the menu`;
    }

    // Close/dismiss buttons
    if (text && /^(close|dismiss|cancel|x|×)$/i.test(text)) {
      return 'Close the dialog';
    }

    // Save/submit buttons
    if (text && /^(save|submit|confirm|ok|apply|update|done)$/i.test(text)) {
      return `Click "${text}" to save changes`;
    }

    // Search fields
    if (tag === 'input' && (id.includes('search') || (step.placeholder || '').toLowerCase().includes('search'))) {
      if (step.inputValue) return `Search for "${step.inputValue}"`;
      return 'Click the search field';
    }

    // Fall back to existing description
    return step.description || 'Click on the page';
  },

  /**
   * Generate a smart title from the steps
   */
  generateTitle(steps) {
    if (steps.length === 0) return 'Untitled Guide';

    // Extract the main domain
    let hostname = '';
    try {
      hostname = new URL(steps[0].url).hostname.replace('www.', '');
    } catch (e) {}

    // Look for the primary action from step descriptions
    const actions = steps
      .map(s => s.description)
      .filter(d => d && !d.includes('Click on the page'));

    // Try to find a meaningful verb-object pair from the steps
    const firstAction = actions[0] || '';
    const lastAction = actions[actions.length - 1] || '';

    // Common patterns: "How to [first action] ... [last action] in [app]"
    if (actions.length >= 3 && hostname) {
      // Extract the key action words
      const firstVerb = this.extractAction(firstAction);
      const lastVerb = this.extractAction(lastAction);

      if (firstVerb && lastVerb && firstVerb !== lastVerb) {
        return `How to ${firstVerb} and ${lastVerb} in ${this.humanizeHostname(hostname)}`;
      }
      if (firstVerb) {
        return `How to ${firstVerb} in ${this.humanizeHostname(hostname)}`;
      }
    }

    if (hostname) {
      return `How to use ${this.humanizeHostname(hostname)}`;
    }

    return 'Untitled Guide';
  },

  /**
   * Extract a human-readable action from a step description
   * "Click "My Preferences"" → "access preferences"
   * "Type "hello" in search" → "search"
   */
  extractAction(desc) {
    if (!desc) return '';

    // "Navigate to X" → "navigate to X"
    const navMatch = desc.match(/^Navigate to "(.+)"$/i);
    if (navMatch) return `navigate to ${navMatch[1]}`;

    // "Click "X" to save" → "save"
    const saveMatch = desc.match(/to (save|submit|update|create|delete|add|remove)/i);
    if (saveMatch) return saveMatch[1].toLowerCase();

    // "Search for X" → "search for X"
    const searchMatch = desc.match(/^Search for "(.+)"$/i);
    if (searchMatch) return `search for ${searchMatch[1]}`;

    // "Click "X"" → "access X" (for meaningful text)
    const clickMatch = desc.match(/^Click "(.+)"$/i);
    if (clickMatch && clickMatch[1].length < 30) {
      return `access ${clickMatch[1]}`;
    }

    return '';
  },

  /**
   * Turn "my-preferences" or "myPreferences" into "My Preferences"
   */
  humanizeId(id) {
    return id
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  },

  /**
   * Turn "app.example.com" into "Example App"
   */
  humanizeHostname(hostname) {
    // Remove common TLDs and subdomains
    const parts = hostname.split('.');
    // Find the meaningful part (not www, app, dashboard, etc.)
    const meaningful = parts.find(p =>
      !['www', 'app', 'dashboard', 'admin', 'portal', 'com', 'org', 'net', 'io', 'co'].includes(p)
    ) || parts[0];

    return meaningful.charAt(0).toUpperCase() + meaningful.slice(1);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.ChinguPolish = ChinguPolish;
}
