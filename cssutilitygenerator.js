const fs = require('fs');
const glob = require('glob');

function generateUtilityClasses(config) {
  const rules = [];

  Object.entries(config.utilities).forEach(([utilityName, utility]) => {
    const { properties, values, variants = [] } = utility;
    Object.entries(values).forEach(([valueKey, value]) => {
      const baseClassName = `${utilityName}-${valueKey}`;
      const baseSelector = `.${baseClassName}`;
      rules.push({
        selector: baseSelector,
        utilityClass: baseClassName,
        css: `${baseSelector} { ${properties.map(p => `${p}: ${value};`).join(' ')} }`
      });

      variants.forEach(variant => {
        if (variant === 'responsive') {
          Object.entries(config.breakpoints).forEach(([bpName, bpValue]) => {
            // Base responsive variant
            const responsiveClass = `${bpName}:${baseClassName}`;
            const responsiveSelector = `.${bpName}\\:${baseClassName}`;
            rules.push({
              selector: responsiveSelector,
              utilityClass: responsiveClass,
              css: `${createMediaQuery(bpValue)} { ${responsiveSelector} { ${properties.map(p => `${p}: ${value};`).join(' ')} } }`
            });

            // Nested variants within responsive
            variants.filter(v => v !== 'responsive').forEach(nestedVariant => {
              if (nestedVariant === 'hover') {
                const responsiveHoverClass = `${bpName}:hover:${baseClassName}`;
                const responsiveHoverSelector = `.${bpName}\\:hover\\:${baseClassName}:hover`;
                rules.push({
                  selector: responsiveHoverSelector,
                  utilityClass: responsiveHoverClass,
                  css: `${createMediaQuery(bpValue)} { ${responsiveHoverSelector} { ${properties.map(p => `${p}: ${value};`).join(' ')} } }`
                });
              }
            });
          });
        }
        else if (variant === 'hover' && !variants.includes('responsive')) {
          const hoverClass = `hover:${baseClassName}`;
          const hoverSelector = `.hover\\:${baseClassName}:hover`;
          rules.push({
            selector: hoverSelector,
            utilityClass: hoverClass,
            css: `${hoverSelector} { ${properties.map(p => `${p}: ${value};`).join(' ')} }`
          });
        }
      });
    });
  });

  return {
    css: rules.map(rule => rule.css).join('\n'),
    rules
  };
}

function createMediaQuery(breakpointValue) {
  return `@media (min-width: ${breakpointValue})`;
}

function generateCustomProperties(variables) {
  const props = Object.entries(variables)
    .map(([name, value]) => `--${name}: ${value};`)
    .join(' ');
  return `:root { ${props} }`;
}

function purgeUnusedUtilities(generatedRules) {
  const usedClasses = new Set();
  const files = glob.sync('src/**/*.@(js|jsx|ts|tsx|html)');

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /className=(?:"([^"]*)"|'([^']*)'|`([^`]*)`|\{([^}]*)\})/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const classes = (match[1] || match[2] || match[3] || match[4] || '').replace(/['"{}`]/g, '');
      classes.split(/\s+/).forEach(cls => {
        if (cls) usedClasses.add(cls.replace(/\\/g, ''));
      });
    }
  });

  return generatedRules
    .filter(rule => usedClasses.has(rule.utilityClass))
    .map(rule => rule.css)
    .join('\n');
}

module.exports = {
  generateUtilityClasses,
  createMediaQuery,
  generateCustomProperties,
  purgeUnusedUtilities
};