import { allure } from 'allure-playwright';

/**
 * Allure reporting utilities for enhanced test reporting
 */
export class AllureReporter {
  /**
   * Add test description
   */
  static addDescription(description: string): void {
    allure.description(description);
  }

  /**
   * Add test owner
   */
  static addOwner(owner: string): void {
    allure.owner(owner);
  }

  /**
   * Add test severity
   */
  static addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    allure.severity(severity);
  }

  /**
   * Add test tags
   */
  static addTags(...tags: string[]): void {
    tags.forEach(tag => allure.tag(tag));
  }

  /**
   * Add epic label
   */
  static addEpic(epic: string): void {
    allure.epic(epic);
  }

  /**
   * Add feature label
   */
  static addFeature(feature: string): void {
    allure.feature(feature);
  }

  /**
   * Add story label
   */
  static addStory(story: string): void {
    allure.story(story);
  }

  /**
   * Add test ID
   */
  static addTestId(testId: string): void {
    allure.id(testId);
  }

  /**
   * Add issue link
   */
  static addIssue(issue: string, url?: string): void {
    if (url) {
      allure.issue(issue, url);
    } else {
      allure.issue(issue, '#');
    }
  }

  /**
   * Add TMS link
   */
  static addTmsLink(testCase: string, url?: string): void {
    if (url) {
      allure.tms(testCase, url);
    } else {
      allure.tms(testCase, '#');
    }
  }

  /**
   * Add custom link
   */
  static addLink(name: string, url: string, type?: string): void {
    allure.link(url, name, type);
  }

  /**
   * Add attachment from file
   */
  static addAttachment(name: string, content: Buffer | string, type: string = 'text/plain'): void {
    allure.attachment(name, content, { contentType: type });
  }

  /**
   * Add step to test execution
   */
  static async step<T>(name: string, body: () => Promise<T>): Promise<T> {
    return allure.step(name, body);
  }

  /**
   * Add parameter to test
   */
  static addParameter(name: string, value: string): void {
    allure.parameter(name, value);
  }

  /**
   * Start test step
   */
  static startStep(name: string): void {
    allure.step(name, async () => {
      // Step started
    });
  }

  /**
   * Add environment information
   */
  static addEnvironmentInfo(info: Record<string, string>): void {
    Object.entries(info).forEach(([key, value]) => {
      allure.parameter(key, value);
    });
  }

  /**
   * Add test metadata in bulk
   */
  static addTestMetadata(metadata: {
    epic?: string;
    feature?: string;
    story?: string;
    severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
    owner?: string;
    tags?: string[];
    testId?: string;
    description?: string;
    issues?: string[];
    tmsLinks?: string[];
  }): void {
    if (metadata.epic) this.addEpic(metadata.epic);
    if (metadata.feature) this.addFeature(metadata.feature);
    if (metadata.story) this.addStory(metadata.story);
    if (metadata.severity) this.addSeverity(metadata.severity);
    if (metadata.owner) this.addOwner(metadata.owner);
    if (metadata.tags) this.addTags(...metadata.tags);
    if (metadata.testId) this.addTestId(metadata.testId);
    if (metadata.description) this.addDescription(metadata.description);
    if (metadata.issues) {
      metadata.issues.forEach(issue => this.addIssue(issue));
    }
    if (metadata.tmsLinks) {
      metadata.tmsLinks.forEach(link => this.addTmsLink(link));
    }
  }
}

/**
 * Decorators for easy test annotation
 */
export const TestMetadata = {
  /**
   * Epic decorator
   */
  Epic: (epic: string) => {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        AllureReporter.addEpic(epic);
        return originalMethod.apply(this, args);
      };
    };
  },

  /**
   * Feature decorator
   */
  Feature: (feature: string) => {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        AllureReporter.addFeature(feature);
        return originalMethod.apply(this, args);
      };
    };
  },

  /**
   * Story decorator
   */
  Story: (story: string) => {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        AllureReporter.addStory(story);
        return originalMethod.apply(this, args);
      };
    };
  },

  /**
   * Severity decorator
   */
  Severity: (severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial') => {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        AllureReporter.addSeverity(severity);
        return originalMethod.apply(this, args);
      };
    };
  },
};
