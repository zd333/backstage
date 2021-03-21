import { createApiRef, Table, useApi, errorApiRef, InfoCard, Progress, MissingAnnotationEmptyState, EmptyState, createRouteRef, createPlugin, createApiFactory, configApiRef, discoveryApiRef, identityApiRef, createRoutableExtension, createComponentExtension } from '@backstage/core';
import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { format } from 'timeago.js';
import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Sparklines, SparklinesBars } from 'react-sparklines';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Routes, Route } from 'react-router';

var platform = "javascript";
var lastSeen = "2020-05-15T09:17:17.384804Z";
var numComments = 0;
var userCount = 0;
var stats = {
	"12h": [
		[
			1589450400,
			7
		],
		[
			1589454000,
			2
		],
		[
			1589457600,
			6
		],
		[
			1589461200,
			8
		],
		[
			1589464800,
			9
		],
		[
			1589468400,
			11
		],
		[
			1589472000,
			4
		],
		[
			1589475600,
			19
		],
		[
			1589479200,
			3
		],
		[
			1589482800,
			24
		],
		[
			1589486400,
			8
		],
		[
			1589490000,
			5
		],
		[
			1589493600,
			5
		],
		[
			1589497200,
			10
		],
		[
			1589500800,
			16
		],
		[
			1589504400,
			24
		],
		[
			1589508000,
			24
		],
		[
			1589511600,
			54
		],
		[
			1589515200,
			4
		],
		[
			1589518800,
			7
		],
		[
			1589522400,
			4
		],
		[
			1589526000,
			4
		],
		[
			1589529600,
			13
		],
		[
			1589533200,
			1
		]
	]
};
var culprit = "https://www.example.com/de/account//";
var title = "TypeError: Failed to fetch";
var id = "991214716";
var assignedTo = null;
var logger = null;
var type = "error";
var annotations = [
];
var metadata = {
	type: "TypeError",
	value: "Failed to fetch"
};
var status = "unresolved";
var subscriptionDetails = null;
var isPublic = false;
var hasSeen = true;
var shortId = "example-slug-21";
var shareId = null;
var firstSeen = "2019-04-18T23:36:40.988000Z";
var count = "169815";
var permalink = "https://sentry.io/organizations/example/issues/99176416/";
var level = "error";
var isSubscribed = false;
var isBookmarked = false;
var project = {
	platform: "javascript-react",
	slug: "example-slug",
	id: "1282343",
	name: "example-slug"
};
var statusDetails = {
};
var mockData = {
	platform: platform,
	lastSeen: lastSeen,
	numComments: numComments,
	userCount: userCount,
	stats: stats,
	culprit: culprit,
	title: title,
	id: id,
	assignedTo: assignedTo,
	logger: logger,
	type: type,
	annotations: annotations,
	metadata: metadata,
	status: status,
	subscriptionDetails: subscriptionDetails,
	isPublic: isPublic,
	hasSeen: hasSeen,
	shortId: shortId,
	shareId: shareId,
	firstSeen: firstSeen,
	count: count,
	permalink: permalink,
	level: level,
	isSubscribed: isSubscribed,
	isBookmarked: isBookmarked,
	project: project,
	statusDetails: statusDetails
};

function getMockIssue() {
  const randomizedStats = {
    "12h": new Array(12).fill(0).map(() => [0, Math.floor(Math.random() * 100)])
  };
  return {
    ...mockData,
    userCount: Math.floor(Math.random() * 1e3),
    stats: randomizedStats
  };
}
function getMockIssues(number) {
  return new Array(number).fill(0).map(getMockIssue);
}
class MockSentryApi {
  fetchIssues() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockIssues(14)), 800);
    });
  }
}

const sentryApiRef = createApiRef({
  id: "plugin.sentry.service",
  description: "Used by the Sentry plugin to make requests"
});

class ProductionSentryApi {
  constructor(discoveryApi, identityApi, organization) {
    this.discoveryApi = discoveryApi;
    this.identityApi = identityApi;
    this.organization = organization;
  }
  async fetchIssues(project, statsFor) {
    if (!project) {
      return [];
    }
    const apiUrl = `${await this.discoveryApi.getBaseUrl("proxy")}/sentry/api`;
    const token = await this.identityApi.getIdToken();
    const response = await fetch(`${apiUrl}/0/projects/${this.organization}/${project}/issues/?statsFor=${statsFor}`, {
      headers: token ? {Authorization: `Bearer ${token}`} : {}
    });
    if (response.status >= 400 && response.status < 600) {
      throw new Error("Failed fetching Sentry issues");
    }
    return await response.json();
  }
}

function stripText(text, maxLength) {
  return text.length > maxLength ? `${text.substr(0, maxLength)}...` : text;
}
const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 260,
    position: "relative",
    "&::before": {
      left: -16,
      position: "absolute",
      width: "4px",
      height: "100%",
      content: '""',
      backgroundColor: theme.palette.status.error,
      borderRadius: 2
    }
  },
  text: {
    marginBottom: 0
  }
}));
const ErrorCell = ({sentryIssue}) => {
  const classes = useStyles();
  return /* @__PURE__ */ React.createElement("div", {
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Link, {
    href: sentryIssue.permalink
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1",
    gutterBottom: true,
    className: classes.text
  }, sentryIssue.metadata.type ? stripText(sentryIssue.metadata.type, 28) : "[No type]")), /* @__PURE__ */ React.createElement(Typography, {
    variant: "caption",
    display: "block",
    gutterBottom: true,
    className: classes.text
  }, sentryIssue.metadata.value && stripText(sentryIssue.metadata.value, 48)));
};

const ErrorGraph = ({sentryIssue}) => {
  const data = "12h" in sentryIssue.stats ? sentryIssue.stats["12h"] : sentryIssue.stats["24h"];
  return /* @__PURE__ */ React.createElement(Sparklines, {
    data: data == null ? void 0 : data.map(([, val]) => val),
    svgHeight: 48,
    margin: 4
  }, /* @__PURE__ */ React.createElement(SparklinesBars, null));
};

const columns = [
  {
    title: "Error",
    render: (data) => /* @__PURE__ */ React.createElement(ErrorCell, {
      sentryIssue: data
    })
  },
  {
    title: "Graph",
    render: (data) => /* @__PURE__ */ React.createElement(ErrorGraph, {
      sentryIssue: data
    })
  },
  {
    title: "First seen",
    field: "firstSeen",
    render: (data) => {
      const {firstSeen} = data;
      return format(firstSeen);
    }
  },
  {
    title: "Last seen",
    field: "lastSeen",
    render: (data) => {
      const {lastSeen} = data;
      return format(lastSeen);
    }
  },
  {
    title: "Events",
    field: "count"
  },
  {
    title: "Users",
    field: "userCount"
  }
];
const SentryIssuesTable = ({sentryIssues}) => {
  return /* @__PURE__ */ React.createElement(Table, {
    columns,
    options: {padding: "dense", paging: true, search: false, pageSize: 5},
    title: "Sentry issues",
    data: sentryIssues
  });
};

const SENTRY_PROJECT_SLUG_ANNOTATION = "sentry.io/project-slug";
const useProjectSlug = (entity) => {
  var _a, _b;
  return (_b = (_a = entity == null ? void 0 : entity.metadata.annotations) == null ? void 0 : _a[SENTRY_PROJECT_SLUG_ANNOTATION]) != null ? _b : "";
};

const SentryIssuesWidget = ({
  entity,
  statsFor = "24h",
  variant = "gridItem"
}) => {
  const errorApi = useApi(errorApiRef);
  const sentryApi = useApi(sentryApiRef);
  const projectId = useProjectSlug(entity);
  const {loading, value, error} = useAsync(() => sentryApi.fetchIssues(projectId, statsFor), [sentryApi, statsFor, projectId]);
  useEffect(() => {
    if (error) {
      errorApi.post(error);
    }
  }, [error, errorApi]);
  if (loading || !projectId || error) {
    return /* @__PURE__ */ React.createElement(InfoCard, {
      title: "Sentry issues",
      variant
    }, loading && /* @__PURE__ */ React.createElement(Progress, null), !loading && !projectId && /* @__PURE__ */ React.createElement(MissingAnnotationEmptyState, {
      annotation: SENTRY_PROJECT_SLUG_ANNOTATION
    }), !loading && error && /* @__PURE__ */ React.createElement(EmptyState, {
      missing: "info",
      title: "No information to display",
      description: `There is no Sentry project with id '${projectId}'.`
    }));
  }
  return /* @__PURE__ */ React.createElement(SentryIssuesTable, {
    sentryIssues: value || []
  });
};

const rootRouteRef = createRouteRef({
  path: "/sentry",
  title: "Sentry"
});
const sentryPlugin = createPlugin({
  id: "sentry",
  apis: [
    createApiFactory({
      api: sentryApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef
      },
      factory: ({configApi, discoveryApi, identityApi}) => new ProductionSentryApi(discoveryApi, identityApi, configApi.getString("sentry.organization"))
    })
  ],
  routes: {
    root: rootRouteRef
  }
});

const EntitySentryContent = sentryPlugin.provide(createRoutableExtension({
  mountPoint: rootRouteRef,
  component: () => import('./esm/index-332e6bc8.esm.js').then(({SentryIssuesWidget}) => {
    const SentryPage = () => {
      const {entity} = useEntity();
      return /* @__PURE__ */ React.createElement(SentryIssuesWidget, {
        entity,
        statsFor: "24h"
      });
    };
    return SentryPage;
  })
}));
const EntitySentryCard = sentryPlugin.provide(createComponentExtension({
  component: {
    lazy: () => import('./esm/index-332e6bc8.esm.js').then(({SentryIssuesWidget}) => {
      const SentryCard = () => {
        const {entity} = useEntity();
        return /* @__PURE__ */ React.createElement(SentryIssuesWidget, {
          entity
        });
      };
      return SentryCard;
    })
  }
}));

const Router = ({entity}) => {
  return /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, {
    path: "/",
    element: /* @__PURE__ */ React.createElement(SentryIssuesWidget, {
      entity,
      statsFor: "24h"
    })
  }), ")");
};

export { EntitySentryCard, EntitySentryContent, MockSentryApi, ProductionSentryApi, Router, SentryIssuesWidget, sentryPlugin as plugin, sentryApiRef, sentryPlugin };
//# sourceMappingURL=index.esm.js.map
