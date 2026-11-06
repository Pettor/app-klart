import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,r as n}from"./react-intl-A4R07ucy.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./button-BrFzn3Nr.js";import{f as o,i as s,p as c,t as l,u}from"./src-CdQSlvMR.js";function d(e,t,n,r,i){return[e.formatMessage({description:`SyncOutdatedDialog: toast - a newer version of the app has synced, so this one paused syncing`,defaultMessage:`Sync paused: {appName} {version} or newer is needed`,id:`rWFIe4`},{appName:t,version:n}),{variant:`warning`,timeout:0,onClose:r,description:i?e.formatMessage({description:`SyncOutdatedDialog: toast - explains what Update does`,defaultMessage:`Another device synced with a newer version. Update to keep syncing; your changes stay here until then.`,id:`9uDkdB`}):e.formatMessage({description:`SyncOutdatedDialog: toast - desktop app, which is updated by installing a new build`,defaultMessage:`Another device synced with a newer version. Install the latest {appName} to keep syncing; your changes stay here until then.`,id:`CPVn82`},{appName:t}),actionProps:i?{children:e.formatMessage({description:`SyncOutdatedDialog: button - load the newest version of the app`,defaultMessage:`Update`,id:`tv/aHl`}),onPress:i}:void 0}]}var f,p,m,h,g,_,v;function y(){return(y=e((()=>{i(),o(),l(),n(),f=r(),{expect:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Feedback/Sync Outdated`,tags:[`autodocs`],decorators:[u,s]},g={render:()=>{let e=t();return(0,f.jsx)(a,{onPress:()=>{let[t,n]=d(e,`Klart`,`0.8`,()=>console.log(`onClose`),()=>console.log(`onUpdate`));c(t,n)},children:`Show Toast`})},play:async({canvas:e,userEvent:t})=>{await t.click(e.getByRole(`button`,{name:`Show Toast`}));let n=m(document.body);await p(await n.findByText(/Klart 0\.8 or newer is needed/i)).toBeInTheDocument(),await p(await n.findByRole(`button`,{name:/update/i})).toBeInTheDocument()}},_={render:()=>{let e=t();return(0,f.jsx)(a,{onPress:()=>{let[t,n]=d(e,`Klart`,`0.8`,()=>console.log(`onClose`),null);c(t,n)},children:`Show Toast`})},play:async({canvas:e,userEvent:t})=>{await t.click(e.getByRole(`button`,{name:`Show Toast`}));let n=m(document.body);await p(await n.findByText(/Install the latest Klart/i)).toBeInTheDocument()}},v=[`CanUpdate`,`Desktop`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const intl = useIntl();
    return <Button onPress={() => {
      const [msg, opts] = SyncOutdatedDialogProps(intl, "Klart", "0.8", () => console.log("onClose"), () => console.log("onUpdate"));
      toast(msg, opts);
    }}>
        Show Toast
      </Button>;
  },
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Show Toast"
    }));
    const body = within(document.body);
    await expect(await body.findByText(/Klart 0\\.8 or newer is needed/i)).toBeInTheDocument();
    await expect(await body.findByRole("button", {
      name: /update/i
    })).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:`The installed web app: "Update" loads the newest version.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const intl = useIntl();
    return <Button onPress={() => {
      const [msg, opts] = SyncOutdatedDialogProps(intl, "Klart", "0.8", () => console.log("onClose"), null);
      toast(msg, opts);
    }}>
        Show Toast
      </Button>;
  },
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Show Toast"
    }));
    const body = within(document.body);
    await expect(await body.findByText(/Install the latest Klart/i)).toBeInTheDocument();
  }
}`,..._.parameters?.docs?.source},description:{story:`The desktop app can't update itself, so the toast only explains.`,..._.parameters?.docs?.description}}}})))()}y();export{g as CanUpdate,_ as Desktop,v as __namedExportsOrder,h as default};