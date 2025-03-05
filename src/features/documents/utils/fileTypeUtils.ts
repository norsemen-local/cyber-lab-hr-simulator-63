
/**
 * Utility functions for detecting and validating file types
 */

export const isPHPFile = (file: File | null): boolean => {
  return !!file && 
         (file.name.endsWith('.php') || 
          file.name.endsWith('.phtml') || 
          file.name.endsWith('.php5'));
};

export const isJSPFile = (file: File | null): boolean => {
  return !!file && 
         (file.name.endsWith('.jsp') || 
          file.name.endsWith('.jspx'));
};

export const isNodeJSFile = (file: File | null): boolean => {
  return !!file && 
         file.name.endsWith('.js');
};

export const isWebShellFile = (file: File | null): boolean => {
  return isPHPFile(file) || isJSPFile(file) || isNodeJSFile(file);
};

export const isExecutableFile = (file: File | null): boolean => {
  return isWebShellFile(file);
};

export const getFileTypeLabel = (file: File | null): string => {
  if (!file) return '';
  if (isPHPFile(file)) return 'PHP';
  if (isJSPFile(file)) return 'JSP';
  if (isNodeJSFile(file)) return 'Node.js';
  return 'Unknown';
};
