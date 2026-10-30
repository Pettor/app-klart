import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{a as n,i as r,n as i,r as a,t as o}from"./SyncDemoData-DQIbI6WQ.js";import{n as s,t as c}from"./SyncStatusCard-3UKGIeYy.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{s(),n(),l=t(),{expect:u,fn:d}=__STORYBOOK_MODULE_TEST__,f=Date.parse(`2026-10-21T10:00:00Z`),p={component:c,title:`Display/Sync Status Card`,tags:[`autodocs`],decorators:[e=>(0,l.jsx)(`div`,{className:`w-60 p-4`,children:(0,l.jsx)(e,{})})]},m={now:f,overview:r({state:`synced`,method:`folder`,folderName:`Klart`,lastSyncedAt:`2026-10-21T09:58:00Z`}),onPress:d()},h={args:m},g={args:{...m,overview:r({state:`local`,method:`local`})}},_={args:{...m,overview:r({state:`needs-permission`,method:`folder`,folderName:`Klart`})}},v={args:{...m,overview:r({state:`error`,method:`folder`,folderName:`Klart`,error:`The folder was moved`})}},y={args:{...m,overview:r({state:`missing`,method:`folder`,folderName:`Klart`})},play:async({canvas:e})=>{await u(e.getByText(`Klart: folder not found`)).toBeVisible()}},b={args:{...m,overview:r({state:`outdated`,method:`folder`,folderName:`Klart`,folderVersion:`0.8`})},play:async({args:e,canvas:t,userEvent:n})=>{await u(t.getByText(`Update to keep syncing`)).toBeVisible(),await u(t.getByText(`Needs version 0.8 or newer`)).toBeVisible(),await n.click(t.getByTestId(`sync-status-card`)),await u(e.onPress).toHaveBeenCalled()}},x={args:{...m,overview:i},play:async({canvas:e})=>{await u(e.getAllByTestId(`sync-status-card__target`)).toHaveLength(2),await u(e.getByText(`2 syncs, all contexts up to date`)).toBeVisible(),await u(e.getByTitle(`Personal, Football club`)).toBeVisible(),await u(e.getByTitle(`Work`)).toBeVisible()}},S={args:{...m,overview:o},play:async({canvas:e})=>{await u(e.getByText(`Sync problem`)).toBeVisible(),await u(e.getByText(`Work OneDrive: The folder was moved`)).toBeVisible()}},C={args:{...m,overview:a}},w={args:{...m,overview:i,variant:`icon`}},T={args:m,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByTestId(`sync-status-card`)),await u(e.onPress).toHaveBeenCalled()}},E=[`Synced`,`LocalOnly`,`NeedsPermission`,`SyncError`,`FolderMissing`,`Outdated`,`SeveralSyncs`,`SeveralSyncsOneFailing`,`SomeContextsOnThisDevice`,`SeveralSyncsIcon`,`OpensSettings`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "local",
      method: "local"
    })
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "needs-permission",
      method: "folder",
      folderName: "Klart"
    })
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "error",
      method: "folder",
      folderName: "Klart",
      error: "The folder was moved"
    })
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "missing",
      method: "folder",
      folderName: "Klart"
    })
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("Klart: folder not found")).toBeVisible();
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: demoSyncOverview({
      state: "outdated",
      method: "folder",
      folderName: "Klart",
      folderVersion: "0.8"
    })
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await expect(canvas.getByText("Update to keep syncing")).toBeVisible();
    await expect(canvas.getByText("Needs version 0.8 or newer")).toBeVisible();
    await userEvent.click(canvas.getByTestId("sync-status-card"));
    await expect(args.onPress).toHaveBeenCalled();
  }
}`,...b.parameters?.docs?.source},description:{story:`A newer version of the app synced first; this one paused syncing until it's updated.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: DEMO_MULTI_SYNC_OVERVIEW
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getAllByTestId("sync-status-card__target")).toHaveLength(2);
    await expect(canvas.getByText("2 syncs, all contexts up to date")).toBeVisible();
    await expect(canvas.getByTitle("Personal, Football club")).toBeVisible();
    await expect(canvas.getByTitle("Work")).toBeVisible();
  }
}`,...x.parameters?.docs?.source},description:{story:`Contexts split across two syncs: each row names a sync and shows its contexts.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: DEMO_MULTI_SYNC_ERROR_OVERVIEW
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText("Sync problem")).toBeVisible();
    await expect(canvas.getByText("Work OneDrive: The folder was moved")).toBeVisible();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: DEMO_PARTIAL_SYNC_OVERVIEW
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    overview: DEMO_MULTI_SYNC_OVERVIEW,
    variant: "icon"
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("sync-status-card"));
    await expect(args.onPress).toHaveBeenCalled();
  }
}`,...T.parameters?.docs?.source}}}})))()}D();export{y as FolderMissing,g as LocalOnly,_ as NeedsPermission,T as OpensSettings,b as Outdated,x as SeveralSyncs,w as SeveralSyncsIcon,S as SeveralSyncsOneFailing,C as SomeContextsOnThisDevice,v as SyncError,h as Synced,E as __namedExportsOrder,p as default};