import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

export class RejectedMarkdownException extends Error {}

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  /**
   * Render a markdown string to HTML (using DomSanitizer to check the results)
   *
   * @param markdown Markdown string
   * @throws RejectedMarkdownException if the sanitizer rejects the generated HTML
   */
  renderAsHtml(markdown: string): string {
    const html = marked.parse(markdown) as string;
    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, html);
    if (sanitizedHtml) return sanitizedHtml;
    else throw new RejectedMarkdownException();
  }
}
