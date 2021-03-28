/// <reference types="react" />
import { Entity } from '@backstage/catalog-model';
import { BackstagePlugin, ApiRef, DiscoveryApi, IdentityApi, RouteRef } from '@backstage/core';
import { CircleCIOptions, BuildSummary, BuildSummaryResponse, Me, BuildWithSteps } from 'circleci-api';
export { BuildStepAction, BuildSummary, BuildWithSteps, GitType } from 'circleci-api';

declare const circleCIPlugin: BackstagePlugin<{}, {}>;
declare const EntityCircleCIContent: (_props: {
    entity?: Entity | undefined;
}) => JSX.Element;

declare const circleCIApiRef: ApiRef<CircleCIApi>;
declare type Options = {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    /**
     * Path to use for requests via the proxy, defaults to /circleci/api
     */
    proxyPath?: string;
};
declare class CircleCIApi {
    private readonly discoveryApi;
    private readonly identityApi;
    private readonly proxyPath;
    constructor(options: Options);
    retry(buildNumber: number, options: Partial<CircleCIOptions>): Promise<BuildSummary>;
    getBuilds({ limit, offset }: {
        limit: number;
        offset: number;
    }, options: Partial<CircleCIOptions>): Promise<BuildSummaryResponse>;
    getUser(options: Partial<CircleCIOptions>): Promise<Me>;
    getBuild(buildNumber: number, options: Partial<CircleCIOptions>): Promise<BuildWithSteps>;
    private getApiUrl;
    private setUpAuthInterceptor;
}

declare const circleCIRouteRef: RouteRef<undefined>;
declare const circleCIBuildRouteRef: RouteRef<undefined>;

declare const isCircleCIAvailable: (entity: Entity) => boolean;
declare type Props = {
    /** @deprecated The entity is now grabbed from context instead */
    entity?: Entity;
};
declare const Router: (_props: Props) => JSX.Element;

declare const CIRCLECI_ANNOTATION = "circleci.com/project-slug";

export { CIRCLECI_ANNOTATION, CircleCIApi, EntityCircleCIContent, Router, circleCIApiRef, circleCIBuildRouteRef, circleCIPlugin, circleCIRouteRef, isCircleCIAvailable, isCircleCIAvailable as isPluginApplicableToEntity, circleCIPlugin as plugin };
