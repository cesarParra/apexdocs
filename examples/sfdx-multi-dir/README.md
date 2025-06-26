# ApexDocs SFDX Project Support Example

This example demonstrates the new **sfdx-project.json support** feature in ApexDocs, which allows you to automatically read source directories from your Salesforce project configuration instead of manually specifying them.

## Feature Overview

ApexDocs now supports three ways to specify source directories:

1. **Single Directory** (`--sourceDir`) - The traditional approach
2. **Multiple Directories** (`--sourceDirs`) - Specify multiple directories manually
3. **SFDX Project** (`--useSfdxProjectJson`) - Automatically read from `sfdx-project.json`

## Project Structure

This example project demonstrates a multi-directory Salesforce project structure:

```
sfdx-multi-dir/
├── sfdx-project.json           # Project configuration
├── force-app/                  # Main application code
│   └── main/default/classes/
│       ├── AccountService.cls
│       └── AccountService.cls-meta.xml
└── force-LWC/                  # Lightning Web Component helpers
    └── main/default/classes/
        ├── LWCHelper.cls
        └── LWCHelper.cls-meta.xml
```

## Configuration Examples

### Using sfdx-project.json (Recommended)

```bash
# Read directories automatically from sfdx-project.json
apexdocs markdown --useSfdxProjectJson --targetDir ./docs --scope public
```

The `sfdx-project.json` file:
```json
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    },
    {
      "path": "force-LWC",
      "default": false
    }
  ]
}
```

### Using Multiple Directories Manually

```bash
# Specify multiple directories manually
apexdocs markdown --sourceDirs force-app force-LWC --targetDir ./docs --scope public
```

### Using Single Directory

```bash
# Traditional single directory approach
apexdocs markdown --sourceDir force-app --targetDir ./docs --scope public
```

### Using SFDX Project with Custom Path

If your `sfdx-project.json` is not in the current directory:

```bash
apexdocs markdown --useSfdxProjectJson --sfdxProjectPath ./my-project --targetDir ./docs
```

### Configuration File Support

You can also use these options in your configuration file:

**package.json:**
```json
{
  "apexdocs": {
    "useSfdxProjectJson": true,
    "scope": ["public", "global"],
    "targetDir": "./docs"
  }
}
```

**apexdocs.config.js:**
```javascript
module.exports = {
  markdown: {
    useSfdxProjectJson: true,
    scope: ['public', 'global'],
    targetDir: './docs'
  }
};
```

## Generators Support

All ApexDocs generators support the new multi-directory features:

### Markdown Documentation
```bash
apexdocs markdown --useSfdxProjectJson --targetDir ./docs
```

### OpenAPI Specification
```bash
apexdocs openapi --useSfdxProjectJson --targetDir ./api-docs --fileName api-spec
```

### Changelog Generation
```bash
apexdocs changelog \
  --useSfdxProjectJsonForPrevious --sfdxProjectPathForPrevious ./v1.0 \
  --useSfdxProjectJsonForCurrent --sfdxProjectPathForCurrent ./v2.0 \
  --targetDir ./changelog
```

## Validation and Error Handling

ApexDocs validates your configuration and provides helpful error messages:

### Conflicting Options
```bash
# ❌ This will fail - cannot use both
apexdocs markdown --sourceDir force-app --useSfdxProjectJson
```

### Missing Directories
If directories specified in `sfdx-project.json` don't exist, you'll get a clear error message.

### Empty Configuration
```bash
# ❌ This will fail - must specify at least one source method
apexdocs markdown --targetDir ./docs
```

## Benefits

### 1. **Consistency**
- Uses the same directory structure as your Salesforce project
- No need to maintain separate documentation configuration

### 2. **Automation**
- Automatically includes all package directories
- Works well with CI/CD pipelines

### 3. **Flexibility**
- Mix and match with other configuration options
- Override specific settings when needed

### 4. **Multi-Package Support**
- Perfect for modularized Salesforce projects
- Supports complex project structures

## Migration Guide

### From Single Directory
**Before:**
```bash
apexdocs markdown --sourceDir force-app --targetDir ./docs
```

**After:**
```bash
apexdocs markdown --useSfdxProjectJson --targetDir ./docs
```

### From Configuration Files
**Before (package.json):**
```json
{
  "apexdocs": {
    "sourceDir": "force-app"
  }
}
```

**After (package.json):**
```json
{
  "apexdocs": {
    "useSfdxProjectJson": true
  }
}
```

## Tips and Best Practices

1. **Metadata Files Required**: Ensure all Apex classes have corresponding `.cls-meta.xml` files
2. **Directory Structure**: Follow standard Salesforce project structure (`main/default/classes/`)
3. **Validation**: Use `--scope` parameter to control which classes are documented
4. **Testing**: Test with `--sortAlphabetically` for consistent output

## Running This Example

1. **Install ApexDocs:**
   ```bash
   npm install -g @cparra/apexdocs
   ```

2. **Generate Documentation:**
   ```bash
   # Using sfdx-project.json
   apexdocs markdown --useSfdxProjectJson --targetDir ./docs --scope public --sortAlphabetically
   
   # Using multiple directories manually
   apexdocs markdown --sourceDirs force-app force-LWC --targetDir ./docs-manual --scope public
   ```

3. **View Results:**
   ```bash
   # View the generated documentation
   open docs/index.md
   ```

## Output

The generated documentation will include classes from all specified directories:

- **Account Management** (from force-app)
  - AccountService
- **Lightning Web Components** (from force-LWC)
  - LWCHelper

This demonstrates how ApexDocs can now seamlessly work with complex, multi-directory Salesforce projects.
