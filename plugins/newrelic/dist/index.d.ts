/// <reference types="react" />
import { BackstagePlugin, RouteRef } from '@backstage/core';

declare const newRelicPlugin: BackstagePlugin<{
    root: RouteRef<undefined>;
}, {}>;
declare const NewRelicPage: () => JSX.Element;

export { NewRelicPage, newRelicPlugin, newRelicPlugin as plugin };
