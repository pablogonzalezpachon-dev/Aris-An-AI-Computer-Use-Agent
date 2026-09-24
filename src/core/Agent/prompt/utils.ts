export function formatTemplate(
  template: string,
  variables: Record<string, any>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}
