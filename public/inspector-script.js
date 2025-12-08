
(() => {
  const PARENT_ORIGIN = '*';
  let isActive = false;
  let onMouseMove = null;
  let onMouseLeave = null;
  let onClick = null;

  function pickStyles(computed) {
    const keys = [
      'display',
      'position',
      'color',
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderTopWidth',
      'borderTopStyle',
      'borderTopColor',
      'borderRightWidth',
      'borderRightStyle',
      'borderRightColor',
      'borderBottomWidth',
      'borderBottomStyle',
      'borderBottomColor',
      'borderLeftWidth',
      'borderLeftStyle',
      'borderLeftColor',
    ];
    const out = {};
    for (const k of keys) {
      out[k] = computed.getPropertyValue(k);
    }
    return out;
  }

  function elementInfoFromTarget(target) {
    if (!(target instanceof Element)) return null;
    const rect = target.getBoundingClientRect();
    const computed = window.getComputedStyle(target);
    const styles = pickStyles(computed);
    const textContent = (target.textContent || '').trim().slice(0, 500);

    return {
      displayText: textContent,
      tagName: target.tagName || '',
      className: (target.className && typeof target.className === 'string') ? target.className : '',
      id: target.id || '',
      textContent,
      styles,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
    };
  }

  function postToParent(type, payload = {}) {
    try {
      window.parent?.postMessage({ type, ...payload }, PARENT_ORIGIN);
    } catch (_) {}
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    onMouseMove = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const elementInfo = elementInfoFromTarget(target);
      if (elementInfo) {
        postToParent('INSPECTOR_HOVER', { elementInfo });
      }
    };

    onMouseLeave = () => {
      postToParent('INSPECTOR_LEAVE');
    };

    onClick = (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (_) {}
      const target = e.target;
      const elementInfo = elementInfoFromTarget(target);
      if (elementInfo) {
        postToParent('INSPECTOR_CLICK', { elementInfo });
      }
    };

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseleave', onMouseLeave, true);
    document.addEventListener('click', onClick, true);
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;

    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseleave', onMouseLeave, true);
    document.removeEventListener('click', onClick, true);

    onMouseMove = null;
    onMouseLeave = null;
    onClick = null;

    postToParent('INSPECTOR_LEAVE');
  }

  // Error forwarding (works with forwardPreviewErrors)
  window.addEventListener('error', (event) => {
    try {
      postToParent('PREVIEW_UNCAUGHT_EXCEPTION', {
        message: event.message,
        stack: event.error?.stack || '',
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    } catch (_) {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      postToParent('PREVIEW_UNHANDLED_REJECTION', {
        message: (reason && reason.message) || String(reason),
        stack: (reason && reason.stack) || '',
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    } catch (_) {}
  });

  // Listen for activation messages from parent
  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'INSPECTOR_ACTIVATE') {
      if (data.active) {
        activate();
      } else {
        deactivate();
      }
    }
  });
})();
