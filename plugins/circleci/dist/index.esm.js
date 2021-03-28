import { createApiRef, createRouteRef, createPlugin, createApiFactory, discoveryApiRef, identityApiRef, createRoutableExtension, useApi, errorApiRef, Breadcrumbs, Link, InfoCard, Progress, Table, StatusWarning, StatusOK, StatusError, StatusRunning, StatusPending, MissingAnnotationEmptyState } from '@backstage/core';
import { postBuildActions, BuildAction, getBuildSummaries, getMe, getFullBuild, GitType } from 'circleci-api';
export { GitType } from 'circleci-api';
import React, { useState, useEffect, Suspense, useRef, useCallback, useMemo } from 'react';
import { SvgIcon, Accordion, AccordionSummary, Typography, AccordionDetails, LinearProgress, Box, Grid, IconButton, makeStyles as makeStyles$1, Link as Link$1, Avatar } from '@material-ui/core';
import { Routes, Route } from 'react-router';
import { useParams, Link as Link$2, generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import LaunchIcon from '@material-ui/icons/Launch';
import { useAsyncRetry } from 'react-use';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getOr } from 'lodash/fp';
import RetryIcon from '@material-ui/icons/Replay';
import GitHubIcon from '@material-ui/icons/GitHub';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';

const circleCIApiRef = createApiRef({
  id: "plugin.circleci.service",
  description: "Used by the CircleCI plugin to make requests"
});
const DEFAULT_PROXY_PATH = "/circleci/api";
class CircleCIApi {
  constructor(options) {
    var _a;
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.proxyPath = (_a = options.proxyPath) != null ? _a : DEFAULT_PROXY_PATH;
  }
  async retry(buildNumber, options) {
    const token = await this.identityApi.getIdToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    return postBuildActions("", buildNumber, BuildAction.RETRY, {
      circleHost: await this.getApiUrl(),
      ...options.vcs
    }, headers);
  }
  async getBuilds({limit = 10, offset = 0}, options) {
    const token = await this.identityApi.getIdToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    return getBuildSummaries("", {
      options: {
        limit,
        offset
      },
      vcs: {},
      circleHost: await this.getApiUrl(),
      ...options
    }, headers);
  }
  async getUser(options) {
    const token = await this.identityApi.getIdToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    return getMe("", {circleHost: await this.getApiUrl(), ...options}, headers);
  }
  async getBuild(buildNumber, options) {
    const token = await this.identityApi.getIdToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    return getFullBuild("", buildNumber, {
      circleHost: await this.getApiUrl(),
      ...options.vcs
    }, headers);
  }
  async getApiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl("proxy");
    return proxyUrl + this.proxyPath;
  }
}

const CircleCIIcon = (props) => /* @__PURE__ */ React.createElement(SvgIcon, {
  ...props,
  enableBackground: "new 0 0 200 200",
  viewBox: "0 0 103.8 105.2"
}, /* @__PURE__ */ React.createElement("path", {
  d: "m38.6 52.6c0-6.9 5.6-12.5 12.5-12.5s12.5 5.6 12.5 12.5-5.6 12.5-12.5 12.5c-6.9.1-12.5-5.6-12.5-12.5zm12.5-52.6c-24.6 0-45.2 16.8-51 39.6 0 .2-.1.3-.1.5 0 1.4 1.1 2.5 2.5 2.5h21.2c1 0 1.9-.6 2.3-1.5 4.4-9.5 13.9-16.1 25.1-16.1 15.2 0 27.6 12.4 27.6 27.6s-12.4 27.6-27.6 27.6c-11.1 0-20.7-6.6-25.1-16.1-.4-.9-1.3-1.5-2.3-1.5h-21.2c-1.4 0-2.5 1.1-2.5 2.5 0 .2 0 .3.1.5 5.8 22.8 26.4 39.6 51 39.6 29.1 0 52.7-23.6 52.7-52.7 0-29-23.6-52.5-52.7-52.5z",
  fill: "#343434"
}));
const circleCIRouteRef = createRouteRef({
  icon: CircleCIIcon,
  path: "",
  title: "CircleCI | All builds"
});
const circleCIBuildRouteRef = createRouteRef({
  path: ":buildId",
  title: "CircleCI | Build info"
});

const circleCIPlugin = createPlugin({
  id: "circleci",
  apis: [
    createApiFactory({
      api: circleCIApiRef,
      deps: {discoveryApi: discoveryApiRef, identityApi: identityApiRef},
      factory: ({discoveryApi, identityApi}) => new CircleCIApi({discoveryApi, identityApi})
    })
  ]
});
const EntityCircleCIContent = circleCIPlugin.provide(createRoutableExtension({
  component: () => Promise.resolve().then(function () { return Router$1; }).then((m) => m.Router),
  mountPoint: circleCIRouteRef
}));

const LazyLog = React.lazy(() => import('react-lazylog/build/LazyLog'));
moment.relativeTimeThreshold("ss", 0);
const useStyles = makeStyles({
  accordionDetails: {
    padding: 0
  },
  button: {
    order: -1,
    marginRight: 0,
    marginLeft: "-20px"
  }
});
const ActionOutput = ({
  url,
  name,
  className,
  action
}) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    fetch(url).then((res) => res.json()).then((actionOutput) => {
      if (typeof actionOutput !== "undefined") {
        setMessages(actionOutput.map(({message}) => message));
      }
    });
  }, [url]);
  const timeElapsed = moment.duration(moment(action.end_time || moment()).diff(moment(action.start_time))).humanize();
  return /* @__PURE__ */ React.createElement(Accordion, {
    TransitionProps: {unmountOnExit: true},
    className
  }, /* @__PURE__ */ React.createElement(AccordionSummary, {
    expandIcon: /* @__PURE__ */ React.createElement(ExpandMoreIcon, null),
    "aria-controls": `panel-${name}-content`,
    id: `panel-${name}-header`,
    IconButtonProps: {
      className: classes.button
    }
  }, /* @__PURE__ */ React.createElement(Typography, {
    variant: "button"
  }, name, " (", timeElapsed, ")")), /* @__PURE__ */ React.createElement(AccordionDetails, {
    className: classes.accordionDetails
  }, messages.length === 0 ? "Nothing here..." : /* @__PURE__ */ React.createElement(Suspense, {
    fallback: /* @__PURE__ */ React.createElement(LinearProgress, null)
  }, /* @__PURE__ */ React.createElement("div", {
    style: {height: "20vh", width: "100%"}
  }, /* @__PURE__ */ React.createElement(LazyLog, {
    text: messages.join("\n"),
    extraLines: 1,
    enableSearch: true
  })))));
};

const useAsyncPolling = (pollingFn, interval) => {
  const isPolling = useRef(false);
  const startPolling = async () => {
    if (isPolling.current === true)
      return;
    isPolling.current = true;
    while (isPolling.current === true) {
      await pollingFn();
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  };
  const stopPolling = () => {
    isPolling.current = false;
  };
  return {startPolling, stopPolling};
};

const CIRCLECI_ANNOTATION = "circleci.com/project-slug";

const makeReadableStatus = (status) => {
  if (!status)
    return "";
  return {
    retried: "Retried",
    canceled: "Canceled",
    infrastructure_fail: "Infra fail",
    timedout: "Timedout",
    not_run: "Not run",
    running: "Running",
    failed: "Failed",
    queued: "Queued",
    scheduled: "Scheduled",
    not_running: "Not running",
    no_tests: "No tests",
    fixed: "Fixed",
    success: "Success"
  }[status];
};
const mapWorkflowDetails = (buildData) => {
  const {workflows} = buildData != null ? buildData : {};
  return {
    id: workflows == null ? void 0 : workflows.workflow_id,
    url: `${buildData.build_url}/workflows/${workflows == null ? void 0 : workflows.workflow_id}`,
    jobName: workflows == null ? void 0 : workflows.job_name,
    name: workflows == null ? void 0 : workflows.workflow_name
  };
};
const mapSourceDetails = (buildData) => {
  const commitDetails = getOr({}, "all_commit_details[0]", buildData);
  return {
    branchName: String(buildData.branch),
    commit: {
      hash: String(buildData.vcs_revision),
      shortHash: String(buildData.vcs_revision).substr(0, 7),
      committerName: buildData.committer_name,
      url: commitDetails.commit_url
    }
  };
};
const mapUser = (buildData) => {
  var _a, _b, _c, _d;
  return {
    isUser: ((_a = buildData == null ? void 0 : buildData.user) == null ? void 0 : _a.is_user) || false,
    login: ((_b = buildData == null ? void 0 : buildData.user) == null ? void 0 : _b.login) || "none",
    name: (_c = buildData == null ? void 0 : buildData.user) == null ? void 0 : _c.name,
    avatarUrl: (_d = buildData == null ? void 0 : buildData.user) == null ? void 0 : _d.avatar_url
  };
};
const transform = (buildsData, restartBuild) => {
  return buildsData.map((buildData) => {
    const tableBuildInfo = {
      id: String(buildData.build_num),
      buildName: buildData.subject ? buildData.subject + (buildData.retry_of ? ` (retry of #${buildData.retry_of})` : "") : "",
      startTime: buildData.start_time,
      stopTime: buildData.stop_time,
      onRestartClick: () => typeof buildData.build_num !== "undefined" && restartBuild(buildData.build_num),
      source: mapSourceDetails(buildData),
      workflow: mapWorkflowDetails(buildData),
      user: mapUser(buildData),
      status: makeReadableStatus(buildData.status),
      buildUrl: buildData.build_url
    };
    return tableBuildInfo;
  });
};
const useProjectSlugFromEntity = () => {
  var _a, _b;
  const {entity} = useEntity();
  const [vcs, owner, repo] = ((_b = (_a = entity.metadata.annotations) == null ? void 0 : _a[CIRCLECI_ANNOTATION]) != null ? _b : "").split("/");
  return {vcs, owner, repo};
};
function mapVcsType(vcs) {
  switch (vcs) {
    case "gh":
    case "github":
      return GitType.GITHUB;
    default:
      return GitType.BITBUCKET;
  }
}
function useBuilds() {
  const {repo, owner, vcs} = useProjectSlugFromEntity();
  const api = useApi(circleCIApiRef);
  const errorApi = useApi(errorApiRef);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const getBuilds = useCallback(async ({limit, offset}) => {
    if (owner === "" || repo === "" || vcs === "") {
      return Promise.reject("No credentials provided");
    }
    try {
      return await api.getBuilds({limit, offset}, {
        vcs: {
          owner,
          repo,
          type: mapVcsType(vcs)
        }
      });
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  }, [repo, owner, vcs, api, errorApi]);
  const restartBuild = async (buildId) => {
    try {
      await api.retry(buildId, {
        vcs: {
          owner,
          repo,
          type: GitType.GITHUB
        }
      });
    } catch (e) {
      errorApi.post(e);
    }
  };
  useEffect(() => {
    getBuilds({limit: 1, offset: 0}).then((b) => setTotal(b == null ? void 0 : b[0].build_num));
  }, [repo, getBuilds]);
  const {loading, value, retry} = useAsyncRetry(() => getBuilds({
    offset: page * pageSize,
    limit: pageSize
  }).then((builds) => transform(builds != null ? builds : [], restartBuild)), [page, pageSize, getBuilds]);
  const projectName = `${owner}/${repo}`;
  return [
    {
      page,
      pageSize,
      loading,
      value,
      projectName,
      total
    },
    {
      getBuilds,
      setPage,
      setPageSize,
      restartBuild,
      retry
    }
  ];
}

const INTERVAL_AMOUNT = 1500;
function useBuildWithSteps(buildId) {
  const {vcs, repo, owner} = useProjectSlugFromEntity();
  const api = useApi(circleCIApiRef);
  const errorApi = useApi(errorApiRef);
  const vcsOption = useMemo(() => ({
    owner,
    repo,
    type: mapVcsType(vcs)
  }), [owner, repo, vcs]);
  const getBuildWithSteps = useCallback(async () => {
    if (owner === "" || repo === "" || vcs === "") {
      return Promise.reject("No credentials provided");
    }
    try {
      const options = {
        vcs: vcsOption
      };
      const build = await api.getBuild(buildId, options);
      return Promise.resolve(build);
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  }, [vcsOption, buildId, api, errorApi]);
  const restartBuild = async () => {
    try {
      await api.retry(buildId, {
        vcs: vcsOption
      });
    } catch (e) {
      errorApi.post(e);
    }
  };
  const {loading, value, retry} = useAsyncRetry(() => getBuildWithSteps(), [
    getBuildWithSteps
  ]);
  const {startPolling, stopPolling} = useAsyncPolling(getBuildWithSteps, INTERVAL_AMOUNT);
  return [
    {loading, value, retry},
    {
      restartBuild,
      getBuildWithSteps,
      startPolling,
      stopPolling
    }
  ];
}

const IconLink = IconButton;
const BuildName = ({build}) => /* @__PURE__ */ React.createElement(Box, {
  display: "flex",
  alignItems: "center"
}, "#", build == null ? void 0 : build.build_num, " - ", build == null ? void 0 : build.subject, /* @__PURE__ */ React.createElement(IconLink, {
  href: build == null ? void 0 : build.build_url,
  target: "_blank"
}, /* @__PURE__ */ React.createElement(LaunchIcon, null)));
const useStyles$1 = makeStyles((theme) => ({
  neutral: {},
  failed: {
    position: "relative",
    "&:after": {
      pointerEvents: "none",
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.error.main}`
    }
  },
  running: {
    position: "relative",
    "&:after": {
      pointerEvents: "none",
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.info.main}`
    }
  },
  cardContent: {
    backgroundColor: theme.palette.background.default
  },
  success: {
    position: "relative",
    "&:after": {
      pointerEvents: "none",
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      boxShadow: `inset 4px 0px 0px ${theme.palette.success.main}`
    }
  }
}));
const pickClassName = (classes, build = {}) => {
  if (build.failed)
    return classes.failed;
  if (["running", "queued"].includes(build.status))
    return classes.running;
  if (build.status === "success")
    return classes.success;
  return classes.neutral;
};
const ActionsList = ({
  actions
}) => {
  const classes = useStyles$1();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, actions.map((action) => /* @__PURE__ */ React.createElement(ActionOutput, {
    className: action.failed ? classes.failed : classes.success,
    action,
    name: action.name,
    url: action.output_url || ""
  })));
};
const BuildsList = ({build}) => /* @__PURE__ */ React.createElement(Box, null, build && build.steps && build.steps.map(({name, actions}) => /* @__PURE__ */ React.createElement(ActionsList, {
  key: name,
  name,
  actions
})));
const BuildWithStepsPage = () => {
  const {buildId = ""} = useParams();
  const classes = useStyles$1();
  const [{loading, value}, {startPolling, stopPolling}] = useBuildWithSteps(parseInt(buildId, 10));
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [buildId, startPolling, stopPolling]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, {
    mb: 3
  }, /* @__PURE__ */ React.createElement(Breadcrumbs, {
    "aria-label": "breadcrumb"
  }, /* @__PURE__ */ React.createElement(Link, {
    to: ".."
  }, "All builds"), /* @__PURE__ */ React.createElement(Typography, null, "Build details"))), /* @__PURE__ */ React.createElement(Grid, {
    container: true,
    spacing: 3,
    direction: "column"
  }, /* @__PURE__ */ React.createElement(Grid, {
    item: true
  }, /* @__PURE__ */ React.createElement(InfoCard, {
    className: pickClassName(classes, value),
    title: /* @__PURE__ */ React.createElement(BuildName, {
      build: value
    }),
    cardClassName: classes.cardContent
  }, loading ? /* @__PURE__ */ React.createElement(Progress, null) : /* @__PURE__ */ React.createElement(BuildsList, {
    build: value
  })))));
};

dayjs.extend(durationPlugin);
dayjs.extend(relativeTimePlugin);
function relativeTimeTo(time, withoutSuffix = false) {
  return dayjs().to(dayjs(time), withoutSuffix);
}
function durationHumanized(startTime, endTime) {
  return dayjs.duration(dayjs(startTime).diff(dayjs(endTime))).humanize();
}

const getStatusComponent = (status = "") => {
  switch (status.toLowerCase()) {
    case "queued":
    case "scheduled":
      return /* @__PURE__ */ React.createElement(StatusPending, null);
    case "running":
      return /* @__PURE__ */ React.createElement(StatusRunning, null);
    case "failed":
      return /* @__PURE__ */ React.createElement(StatusError, null);
    case "success":
      return /* @__PURE__ */ React.createElement(StatusOK, null);
    case "canceled":
    default:
      return /* @__PURE__ */ React.createElement(StatusWarning, null);
  }
};
const useStyles$2 = makeStyles$1((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
      verticalAlign: "center"
    }
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  }
}));
const SourceInfo = ({build}) => {
  var _a, _b;
  const classes = useStyles$2();
  const {user, source} = build;
  return /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    alignItems: "center",
    className: classes.root
  }, /* @__PURE__ */ React.createElement(Avatar, {
    alt: user.name,
    src: user.avatarUrl,
    className: classes.small
  }), /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, {
    variant: "button"
  }, source == null ? void 0 : source.branchName), /* @__PURE__ */ React.createElement(Typography, {
    variant: "body1"
  }, ((_a = source == null ? void 0 : source.commit) == null ? void 0 : _a.url) !== void 0 ? /* @__PURE__ */ React.createElement(Link$1, {
    href: (_b = source == null ? void 0 : source.commit) == null ? void 0 : _b.url,
    target: "_blank"
  }, source == null ? void 0 : source.commit.shortHash) : source == null ? void 0 : source.commit.shortHash)));
};
const generatedColumns = [
  {
    title: "ID",
    field: "id",
    type: "numeric",
    width: "80px"
  },
  {
    title: "Build",
    field: "buildName",
    highlight: true,
    width: "20%",
    render: (row) => {
      var _a;
      return /* @__PURE__ */ React.createElement(Link$1, {
        component: Link$2,
        to: `${generatePath(circleCIBuildRouteRef.path, {
          buildId: row.id
        })}`
      }, row.buildName ? row.buildName : (_a = row == null ? void 0 : row.workflow) == null ? void 0 : _a.name);
    }
  },
  {
    title: "Job",
    field: "buildName",
    highlight: true,
    render: (row) => {
      var _a;
      return /* @__PURE__ */ React.createElement(Link$1, {
        href: row == null ? void 0 : row.buildUrl,
        target: "_blank"
      }, /* @__PURE__ */ React.createElement(Box, {
        display: "flex",
        alignItems: "center"
      }, /* @__PURE__ */ React.createElement(LaunchIcon, {
        fontSize: "small",
        color: "disabled"
      }), /* @__PURE__ */ React.createElement(Box, {
        mr: 1
      }), (_a = row == null ? void 0 : row.workflow) == null ? void 0 : _a.jobName));
    }
  },
  {
    title: "Source",
    field: "source.commit.hash",
    highlight: true,
    render: (row) => /* @__PURE__ */ React.createElement(SourceInfo, {
      build: row
    })
  },
  {
    title: "Status",
    field: "status",
    render: (row) => /* @__PURE__ */ React.createElement(Box, {
      display: "flex",
      alignItems: "center"
    }, getStatusComponent(row.status), /* @__PURE__ */ React.createElement(Box, {
      mr: 1
    }), /* @__PURE__ */ React.createElement(Typography, {
      variant: "button"
    }, row.status))
  },
  {
    title: "Time",
    field: "startTime",
    render: (row) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "run ", relativeTimeTo(row == null ? void 0 : row.startTime)), /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2"
    }, "took ", durationHumanized(row == null ? void 0 : row.startTime, row == null ? void 0 : row.stopTime)))
  },
  {
    title: "Workflow",
    field: "workflow.name"
  },
  {
    title: "Actions",
    width: "10%",
    render: (row) => /* @__PURE__ */ React.createElement(IconButton, {
      onClick: row.onRestartClick
    }, /* @__PURE__ */ React.createElement(RetryIcon, null))
  }
];
const CITable = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  builds,
  onChangePage,
  onChangePageSize,
  total
}) => {
  return /* @__PURE__ */ React.createElement(Table, {
    isLoading: loading,
    options: {
      paging: true,
      pageSize,
      padding: "dense",
      pageSizeOptions: [10, 20, 50]
    },
    totalCount: total,
    page,
    actions: [
      {
        icon: () => /* @__PURE__ */ React.createElement(RetryIcon, null),
        tooltip: "Refresh Data",
        isFreeAction: true,
        onClick: () => retry()
      }
    ],
    data: builds,
    onChangePage,
    onChangeRowsPerPage: onChangePageSize,
    title: /* @__PURE__ */ React.createElement(Box, {
      display: "flex",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(GitHubIcon, null), /* @__PURE__ */ React.createElement(Box, {
      mr: 1
    }), /* @__PURE__ */ React.createElement(Typography, {
      variant: "h6"
    }, projectName)),
    columns: generatedColumns
  });
};

const Builds = () => {
  const [
    {total, loading, value, projectName, page, pageSize},
    {setPage, retry, setPageSize}
  ] = useBuilds();
  return /* @__PURE__ */ React.createElement(CITable, {
    total,
    loading,
    retry,
    builds: value != null ? value : [],
    projectName,
    page,
    onChangePage: setPage,
    pageSize,
    onChangePageSize: setPageSize
  });
};

const BuildsPage = () => /* @__PURE__ */ React.createElement(Grid, {
  container: true,
  spacing: 3,
  direction: "column"
}, /* @__PURE__ */ React.createElement(Grid, {
  item: true
}, /* @__PURE__ */ React.createElement(Builds, null)));

const isCircleCIAvailable = (entity) => {
  var _a;
  return Boolean((_a = entity.metadata.annotations) == null ? void 0 : _a[CIRCLECI_ANNOTATION]);
};
const Router = (_props) => {
  const {entity} = useEntity();
  if (!isCircleCIAvailable(entity)) {
    return /* @__PURE__ */ React.createElement(MissingAnnotationEmptyState, {
      annotation: CIRCLECI_ANNOTATION
    });
  }
  return /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, {
    path: `/${circleCIRouteRef.path}`,
    element: /* @__PURE__ */ React.createElement(BuildsPage, null)
  }), /* @__PURE__ */ React.createElement(Route, {
    path: `/${circleCIBuildRouteRef.path}`,
    element: /* @__PURE__ */ React.createElement(BuildWithStepsPage, null)
  }));
};

var Router$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isCircleCIAvailable: isCircleCIAvailable,
  Router: Router
});

export { CIRCLECI_ANNOTATION, CircleCIApi, EntityCircleCIContent, Router, circleCIApiRef, circleCIBuildRouteRef, circleCIPlugin, circleCIRouteRef, isCircleCIAvailable, isCircleCIAvailable as isPluginApplicableToEntity, circleCIPlugin as plugin };
//# sourceMappingURL=index.esm.js.map
