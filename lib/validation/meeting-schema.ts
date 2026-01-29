/**
 * Meeting Metadata Validation Schema
 *
 * Defines validation rules and messages for meeting metadata form fields.
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface FieldValidation {
  rules: ValidationRule;
  errorMessages: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Meeting metadata validation schema
 */
export const meetingMetadataSchema: Record<string, FieldValidation> = {
  meetingTitle: {
    rules: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    errorMessages: {
      required: 'Meeting title is required',
      minLength: 'Meeting title must be at least 3 characters',
      maxLength: 'Meeting title must be less than 100 characters',
    },
  },
  entity: {
    rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    errorMessages: {
      required: 'Entity name is required',
      minLength: 'Entity name must be at least 2 characters',
      maxLength: 'Entity name must be less than 100 characters',
    },
  },
  date: {
    rules: {
      required: true,
    },
    errorMessages: {
      required: 'Meeting date is required',
    },
  },
  time: {
    rules: {
      required: false,
    },
    errorMessages: {},
  },
  jurisdiction: {
    rules: {
      required: false,
    },
    errorMessages: {},
  },
  meetingType: {
    rules: {
      required: true,
    },
    errorMessages: {
      required: 'Meeting type is required',
    },
  },
};

/**
 * Validate a single field value against its schema
 */
export function validateField(
  fieldName: string,
  value: string | undefined | null
): string | null {
  const schema = meetingMetadataSchema[fieldName];
  if (!schema) return null;

  const { rules, errorMessages } = schema;
  const stringValue = value?.trim() ?? '';

  // Required check
  if (rules.required && !stringValue) {
    return errorMessages.required || 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!stringValue) return null;

  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return (
      errorMessages.minLength ||
      `Must be at least ${rules.minLength} characters`
    );
  }

  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return (
      errorMessages.maxLength ||
      `Must be less than ${rules.maxLength} characters`
    );
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return errorMessages.pattern || 'Invalid format';
  }

  return null;
}

/**
 * Validate all form fields
 */
export function validateForm(
  formData: Record<string, string | undefined | null>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const fieldName of Object.keys(meetingMetadataSchema)) {
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if a field is required
 */
export function isFieldRequired(fieldName: string): boolean {
  return meetingMetadataSchema[fieldName]?.rules.required ?? false;
}

/**
 * Get all required field names
 */
export function getRequiredFields(): string[] {
  return Object.entries(meetingMetadataSchema)
    .filter(([, schema]) => schema.rules.required)
    .map(([fieldName]) => fieldName);
}
