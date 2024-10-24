# Show Favicon from Metadata

**Obsidian Plugin** – Show Favicon from Metadata

## Description
This Obsidian plugin extracts a URL from the frontmatter of your notes and displays an associated favicon image next to the note title in the file tree. It supports both standard URLs and base64-encoded images, making it easy to visually distinguish notes at a glance.

## Features
- **Favicon Display**: Automatically display favicons next to note titles based on URLs provided in the frontmatter.
- **Base64 Image Support**: Allows embedding base64-encoded images directly in the frontmatter for greater flexibility.
- **Dynamic Updates**: Icons update in real-time as metadata is added, modified, or removed.

## Installation
### From GitHub
1. Download the latest release from the [Releases page](https://github.com/mdklab/show-favicon-from-metadata/releases).
2. Extract the contents to your Obsidian vault's plugins folder (`.obsidian/plugins`).
3. Enable the plugin in Obsidian's community plugin settings.

### From Obsidian
Not available yet.

## Usage
1. Add a `favicon` field to the frontmatter of any note. Example:
   ```yaml
   ---
   favicon: http://www.example.com
   ---
   ```
   Or use a base64-encoded image:
   ```yaml
   ---
   favicon: data:image/png;base64,iVBORw0KGgoAAAANS...
   ---
   ```

2. The favicon will automatically appear next to the note title in the file tree once added.

## Example
Here is how a note frontmatter with a favicon URL looks:
```yaml
---
favicon: http://www.stackoverflow.com
---
```

This will show the StackOverflow favicon next to the note in the file tree.

Another example with base64 images:
```yaml
---
favicon: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACm0lEQVQ4jWWSTYhWdRjFz/P8P+577zhOUpothFYTfSC0G4lwNUGBoMhAU4RBUBQEtXAWru6EKI20ihYtcmFazQwi7cRNGxdFgStpoRi5cdGXovO+9/6/TouZV8bXs/vD8xzOc/4/YEJtSwWAC6e5a/VMuPrDSrg6ObNd8uiTAgjPnhzum6rc6s4d9sDd+/EXk+TTFOyNt1r5e9LATi6fP9W/4Ct3yRqZDREAzLfFliV1qQLwxnhuvKXbwvBcyz3G4rI1MptzzsMu3yrgHyJ4rRnY11dX4hIgJCiPGIzvdlV4xTm/r4+hrytjiLxmWOab2jajPhUCJ775/K9pmUxw/fpmF2rMroEHQJEukgrzOwXzMYKlUCm0DZ6a3t6BAsD6uuS1BZrIcOXBRvypHjgfYiql5A6QmUxABFRIZUx8BqCQm2c87GDjRUxbdd9R9IvQxxvTjTNUeQIo/1oDAdENKmtT4jwgXF7eSr2wQAMAVR2PPP2kfRUlv5uKfD1VI6hgINQ1bxG9d3WIpajRj8+e4u62lQJQZFzibB2uDSr3UsrMKXNRGO9u/rJMiaBQymFn3XtWgVGI5xeP+3cAigWA55t8xHm7vw8p7Gic3xill0mzt6ntsVGf1Du9Per0k6jpz5kp+1kXsHfMgwJAQZmpnEJEsggJyIyoelVYghnQZ6sKF5nx63/3wpWSZRkQtqDKlhO+X0lf1ZX5UBV4MAwnBJhrGn9oOIoFIL33NvbxJkfu4Jst7oxZ0C0subhkP+r6eKEPBRb+N1Wdi5GAoIiI5FRIwe7Q3+8fA2mse0P3fig8nDXMVc7WMSXWlXMiarxTEeHPx07v/OcxkMb6oJXh28ftj531X2biOZJHR104WXK5VkoBIevb0QeA/wGJbEKYYXTTdwAAAABJRU5ErkJggg==
---
```

This will show the Obsidian favicon next to the note in the file tree.


## Permissions
This plugin requires the following permissions:
- **Read Vault**: To access the metadata of the notes.
- **Modify Workspace**: To update the file tree and display the icons.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or report issues in the [GitHub repository](https://github.com/mdklab/show-favicon-from-metadata).

## Support
If you find this plugin useful, consider [sponsoring me](https://github.com/sponsors/mdklab) to support future development.

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/mdklab/show-favicon-from-metadata/blob/main/LICENSE) file for details.

