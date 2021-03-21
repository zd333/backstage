import { createApiRef, useApi, Progress, Table, Page, Header, HeaderLabel, Content, ContentHeader, SupportButton, createRouteRef, createPlugin, createApiFactory, discoveryApiRef, identityApiRef, createRoutableExtension } from '@backstage/core';
import React from 'react';
import { Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';

const newRelicApiRef = createApiRef({
  id: "plugin.newrelic.service",
  description: "Used by the NewRelic plugin to make requests"
});
const DEFAULT_PROXY_PATH_BASE = "/newrelic";
class NewRelicClient {
  constructor(options) {
    var _a;
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.proxyPathBase = (_a = options.proxyPathBase) != null ? _a : DEFAULT_PROXY_PATH_BASE;
  }
  async getApplications() {
    var _a;
    const url = await this.getApiUrl("apm", "applications.json");
    const token = await this.identityApi.getIdToken();
    const response = await fetch(url, {
      headers: token ? {Authorization: `Bearer ${token}`} : {}
    });
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (e) {
      responseJson = {applications: []};
    }
    if (response.status !== 200) {
      throw new Error(`Error communicating with New Relic: ${((_a = responseJson == null ? void 0 : responseJson.error) == null ? void 0 : _a.title) || response.statusText}`);
    }
    return responseJson;
  }
  async getApiUrl(product, path) {
    const proxyUrl = await this.discoveryApi.getBaseUrl("proxy");
    return `${proxyUrl}${this.proxyPathBase}/${product}/api/${path}`;
  }
}

const NewRelicAPMTable = ({applications}) => {
  const columns = [
    {title: "Application", field: "name"},
    {title: "Response Time", field: "responseTime"},
    {title: "Throughput", field: "throughput"},
    {title: "Error Rate", field: "errorRate"},
    {title: "Instance Count", field: "instanceCount"},
    {title: "Apdex", field: "apdexScore"}
  ];
  const data = applications.map((app) => {
    const {name, application_summary: applicationSummary} = app;
    const {
      response_time: responseTime,
      throughput,
      error_rate: errorRate,
      instance_count: instanceCount,
      apdex_score: apdexScore
    } = applicationSummary;
    return {
      name,
      responseTime: `${responseTime} ms`,
      throughput: `${throughput} rpm`,
      errorRate: `${errorRate}%`,
      instanceCount,
      apdexScore
    };
  });
  return /* @__PURE__ */ React.createElement(Table, {
    title: "Application Performance Monitoring",
    options: {search: false, paging: false},
    columns,
    data
  });
};
const NewRelicFetchComponent = () => {
  const api = useApi(newRelicApiRef);
  const {value, loading, error} = useAsync(async () => {
    const data = await api.getApplications();
    return data.applications.filter((application) => {
      return application.hasOwnProperty("application_summary");
    });
  }, []);
  if (loading) {
    return /* @__PURE__ */ React.createElement(Progress, null);
  } else if (error) {
    return /* @__PURE__ */ React.createElement(Alert, {
      severity: "error"
    }, error.message);
  }
  return /* @__PURE__ */ React.createElement(NewRelicAPMTable, {
    applications: value || []
  });
};

const NewRelicComponent = () => /* @__PURE__ */ React.createElement(Page, {
  themeId: "tool"
}, /* @__PURE__ */ React.createElement(Header, {
  title: "New Relic"
}, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Engineering"
})), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
  title: "New Relic"
}, /* @__PURE__ */ React.createElement(SupportButton, null, "New Relic Application Performance Monitoring")), /* @__PURE__ */ React.createElement(Grid, {
  container: true,
  spacing: 3,
  direction: "column"
}, /* @__PURE__ */ React.createElement(Grid, {
  item: true
}, /* @__PURE__ */ React.createElement(NewRelicFetchComponent, null)))));

const rootRouteRef = createRouteRef({
  path: "/newrelic",
  title: "newrelic"
});
const newRelicPlugin = createPlugin({
  id: "newrelic",
  apis: [
    createApiFactory({
      api: newRelicApiRef,
      deps: {discoveryApi: discoveryApiRef, identityApi: identityApiRef},
      factory: ({discoveryApi, identityApi}) => new NewRelicClient({discoveryApi, identityApi})
    })
  ],
  register({router}) {
    router.addRoute(rootRouteRef, NewRelicComponent);
  },
  routes: {
    root: rootRouteRef
  }
});
const NewRelicPage = newRelicPlugin.provide(createRoutableExtension({
  component: () => import('./index-83e0f3ec.esm.js').then((m) => m.default),
  mountPoint: rootRouteRef
}));

export { NewRelicComponent as N, NewRelicPage as a, newRelicPlugin as n };
//# sourceMappingURL=index-2ca390cf.esm.js.map
