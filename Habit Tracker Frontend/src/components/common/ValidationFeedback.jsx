import React from 'react';

/**
 * ValidationFeedback component for showing inline validation messages
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the feedback
 * @param {string} props.type - Type of feedback: 'error', 'warning', 'success', 'info'
 * @param {string} props.message - Message to display
 * @param {string} props.className - Additional CSS classes
 */
const ValidationFeedback = ({ show, type = 'error', message, className = '' }) => {
  if (!show || !message) return null;

  const baseClasses = 'form-text small';
  const typeClasses = {
    error: 'text-danger',
    warning: 'text-warning',
    success: 'text-success',
    info: 'text-info'
  };

  const classes = `${baseClasses} ${typeClasses[type]} ${className}`.trim();

  return (
    <div className={classes}>
      <small>
        {type === 'error' && '⚠️ '}
        {type === 'warning' && '⚡ '}
        {type === 'success' && '✅ '}
        {type === 'info' && 'ℹ️ '}
        {message}
      </small>
    </div>
  );
};

/**
 * FieldValidation component for validating individual fields
 * @param {Object} props - Component props
 * @param {string} props.value - Field value to validate
 * @param {Function} props.validator - Validation function
 * @param {boolean} props.showOnBlur - Whether to show validation on blur only
 * @param {boolean} props.showOnTouched - Whether to show validation after field has been touched
 * @param {Object} props.validationConfig - Additional validation configuration
 */
class FieldValidation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isValid: true,
      message: '',
      touched: false,
      blurred: false
    };
  }

  validate = (value) => {
    const { validator } = this.props;
    
    if (!validator || typeof validator !== 'function') {
      return { isValid: true, message: '' };
    }

    try {
      return validator(value);
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false, message: 'Validation error occurred' };
    }
  };

  handleBlur = () => {
    const { value, validator, showOnBlur = true } = this.props;
    
    this.setState({ blurred: true });
    
    if (showOnBlur && validator) {
      const validation = this.validate(value);
      this.setState({
        isValid: validation.isValid,
        message: validation.message
      });
    }
  };

  handleFocus = () => {
    this.setState({ touched: true });
  };

  componentDidUpdate(prevProps) {
    const { value, showOnTouched = false, showOnBlur = false } = this.props;
    
    // Re-validate if value changed and field has been interacted with
    if (prevProps.value !== value && 
        ((showOnTouched && this.state.touched) || 
         (showOnBlur && this.state.blurred))) {
      const validation = this.validate(value);
      this.setState({
        isValid: validation.isValid,
        message: validation.message
      });
    }
  }

  render() {
    const { showOnBlur, showOnTouched, children } = this.props;
    const { isValid, message, touched, blurred } = this.props.state || this.state;
    
    const shouldShow = (showOnBlur && blurred) || (showOnTouched && touched) || (!showOnBlur && !showOnTouched);
    
    return (
      <>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onBlur: (e) => {
                this.handleBlur();
                if (child.props.onBlur) {
                  child.props.onBlur(e);
                }
              },
              onFocus: (e) => {
                this.handleFocus();
                if (child.props.onFocus) {
                  child.props.onFocus(e);
                }
              }
            });
          }
          return child;
        })}
        <ValidationFeedback 
          show={shouldShow && !isValid} 
          type="error" 
          message={message} 
        />
      </>
    );
  }
}

/**
 * EmailValidation component specifically for email validation
 */
const EmailValidation = ({ value, showOnBlur = true, showOnTouched = false, children }) => {
  const { validateEmail } = require('../../utils/validation');
  
  return (
    <FieldValidation
      value={value}
      validator={validateEmail}
      showOnBlur={showOnBlur}
      showOnTouched={showOnTouched}
    >
      {children}
    </FieldValidation>
  );
};

/**
 * MobileValidation component specifically for mobile number validation
 */
const MobileValidation = ({ value, showOnBlur = true, showOnTouched = false, children }) => {
  const { validateMobile } = require('../../utils/validation');
  
  return (
    <FieldValidation
      value={value}
      validator={validateMobile}
      showOnBlur={showOnBlur}
      showOnTouched={showOnTouched}
    >
      {children}
    </FieldValidation>
  );
};

export {
  ValidationFeedback,
  FieldValidation,
  EmailValidation,
  MobileValidation
};

export default ValidationFeedback;
