import { TestBed } from '@angular/core/testing';

import { MarkdownService, RejectedMarkdownException } from './markdown.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('MarkdownService', () => {
  let service: MarkdownService;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['sanitize']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomSanitizer,
          useValue: sanitizerSpy,
        },
      ],
    });
    service = TestBed.inject(MarkdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render some markdown', () => {
    sanitizerSpy.sanitize.and.callFake((ctx, html: string) => html);
    const rendered = service.renderAsHtml('test');
    expect(rendered).toContain('test');
  });

  it('should throw if the sanitizer fails', () => {
    sanitizerSpy.sanitize.and.returnValue(null);
    expect(() => service.renderAsHtml('test')).toThrowError(RejectedMarkdownException);
  });
});
