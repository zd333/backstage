/// <reference types="react" />
import { ApiRef, DiscoveryApi, IdentityApi, BackstagePlugin, RouteRef } from '@backstage/core';
import { Entity } from '@backstage/catalog-model';

declare type SentryPlatform = 'javascript' | 'javascript-react' | string;
declare type EventPoint = number[];
declare type SentryProject = {
    platform: SentryPlatform;
    slug: string;
    id: string;
    name: string;
};
declare type SentryIssueMetadata = {
    function?: string;
    type?: string;
    value?: string;
    filename?: string;
};
declare type SentryIssue = {
    platform: SentryPlatform;
    lastSeen: string;
    numComments: number;
    userCount: number;
    stats: {
        '24h'?: EventPoint[];
        '12h'?: EventPoint[];
    };
    culprit: string;
    title: string;
    id: string;
    assignedTo: any;
    logger: any;
    type: string;
    annotations: any[];
    metadata: SentryIssueMetadata;
    status: string;
    subscriptionDetails: any;
    isPublic: boolean;
    hasSeen: boolean;
    shortId: string;
    shareId: string | null;
    firstSeen: string;
    count: string;
    permalink: string;
    level: string;
    isSubscribed: boolean;
    isBookmarked: boolean;
    project: SentryProject;
    statusDetails: any;
};

declare const sentryApiRef: ApiRef<SentryApi>;
interface SentryApi {
    fetchIssues(project: string, statsFor: string): Promise<SentryIssue[]>;
}

declare class MockSentryApi implements SentryApi {
    fetchIssues(): Promise<SentryIssue[]>;
}

declare class ProductionSentryApi implements SentryApi {
    private readonly discoveryApi;
    private readonly identityApi;
    private readonly organization;
    constructor(discoveryApi: DiscoveryApi, identityApi: IdentityApi, organization: string);
    fetchIssues(project: string, statsFor: string): Promise<SentryIssue[]>;
}

declare const SentryIssuesWidget: ({ entity, statsFor, variant, }: {
    entity: Entity;
    statsFor?: "12h" | "24h" | undefined;
    variant?: "flex" | "fullHeight" | "gridItem" | undefined;
}) => JSX.Element;

declare const sentryPlugin: BackstagePlugin<{
    root: RouteRef<undefined>;
}, {}>;

declare const EntitySentryContent: () => JSX.Element;
declare const EntitySentryCard: () => JSX.Element;

declare const Router: ({ entity }: {
    entity: Entity;
}) => JSX.Element;

export { EntitySentryCard, EntitySentryContent, MockSentryApi, ProductionSentryApi, Router, SentryApi, SentryIssue, SentryIssuesWidget, sentryPlugin as plugin, sentryApiRef, sentryPlugin };
