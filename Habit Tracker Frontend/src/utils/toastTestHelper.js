/**
 * Toast Testing Helper - For development and testing
 */

// Test functions that accept toast functions as parameters
export function testAllToastTypes(toastFunctions) {
  const { success, error, warning, info } = toastFunctions;
  
  // Test success toast
  setTimeout(() => {
    success('✅ Success! Your action was completed successfully.');
  }, 100);
  
  // Test error toast
  setTimeout(() => {
    error('❌ Error! Something went wrong. Please try again.');
  }, 1000);
  
  // Test warning toast
  setTimeout(() => {
    warning('⚠️ Warning! Please review your input.');
  }, 2000);
  
  // Test info toast
  setTimeout(() => {
    info('ℹ️ Info: Here is some useful information.');
  }, 3000);
}

// Test long messages
export function testLongMessages(toastFunctions) {
  const { success, error } = toastFunctions;
  
  success('This is a very long success message that should wrap properly and display correctly in the toast container without breaking the layout or causing any overflow issues.');
  
  error('This is an extremely long error message that contains detailed information about what went wrong and how the user can potentially fix the issue by following certain steps and guidelines.');
}

// Test rapid succession
export function testRapidSuccession(toastFunctions) {
  const { info, success, warning, error } = toastFunctions;
  
  for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
      const types = [info, success, warning, error];
      const messages = [
        `Quick notification ${i}`,
        `Fast message ${i}`,
        `Rapid alert ${i}`,
        `Speed test ${i}`
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      randomType(randomMessage);
    }, i * 500);
  }
}

// Test empty/invalid messages
export function testInvalidMessages(toastFunctions) {
  const { success, error, warning, info } = toastFunctions;
  
  // These should be handled gracefully
  success('');
  error(null);
  warning(undefined);
  info(123);
  
  // These should work
  setTimeout(() => {
    success('Valid message after invalid ones');
  }, 1000);
}

// Development helper setup
export function setupToastTesting() {
  if (process.env.NODE_ENV === 'development') {
    
    // This will be set up by the ToastTest component
    window.toastTestSetup = true;
    
    // Make toast testing functions available globally
    window.toastTest = {
      testAll: testAllToastTypes,
      testLong: testLongMessages,
      testRapid: testRapidSuccession,
      testInvalid: testInvalidMessages,
    };
  }
}
