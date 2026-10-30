import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./TaskEditor-CvoYtO85.js";import{c as r,t as i}from"./src-CdQSlvMR.js";import{n as a,o}from"./KlartContext-B0iHfyQE.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{i(),t(),o(),{expect:s,fn:c}=__STORYBOOK_MODULE_TEST__,l={component:n,title:`Input/Task Editor`,tags:[`autodocs`],decorators:[r]},u={task:{id:`w1`,title:`Review sync PR for gateway client`,done:!1,important:!1,due:`2026-10-21`,remindAt:`2026-10-21T14:00`,tags:[`acme`,`review`],links:[`https://github.com/acme/gateway-client/pull/412`],notes:``,contextId:`work`,contextColor:`orange`,isInMyDay:!0,file:`tasks/work/w1.json`},contexts:a.map(e=>({id:e.id,name:e.name,color:e.color})),onChange:c(),onToggleDone:c(),onToggleImportant:c(),onToggleMyDay:c(),onArchive:c(),onClose:c()},d={args:u},f={args:{...u,task:{...u.task,important:!0,notes:`Check the retry logic first.`}}},p={args:{...u,task:{...u.task,done:!0}}},m={args:{...u,task:{...u.task,isInMyDay:!1,due:null,remindAt:null,links:[]}}},h={args:u,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`task-editor__title`);await n.clear(r),await n.type(r,`Review and merge sync PR{Enter}`),await s(e.onChange).toHaveBeenCalledWith({title:`Review and merge sync PR`})}},g={args:u,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`task-editor__title`);await n.clear(r),await n.tab(),await s(e.onChange).not.toHaveBeenCalled(),await s(r).toHaveValue(u.task.title)}},_={args:u,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`task-editor__tags`);await n.clear(r),await n.type(r,`#Acme, team{Enter}`),await s(e.onChange).toHaveBeenCalledWith({tags:[`acme`,`team`]}),await s(r).toHaveValue(`#acme #team`)}},v={args:u,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByTestId(`task-editor__new-link`);await n.type(r,`not a link{Enter}`),await s(e.onChange).not.toHaveBeenCalled(),await s(t.getByText(`Links must start with http://, https:// or www.`)).toBeVisible(),await n.clear(r),await n.type(r,`https://notion.so/spec{Enter}`),await s(e.onChange).toHaveBeenCalledWith({links:[`https://github.com/acme/gateway-client/pull/412`,`https://notion.so/spec`]})}},y={args:u,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByTestId(`task-editor__toggle`)),await s(e.onToggleDone).toHaveBeenCalled(),await n.click(t.getByTestId(`task-editor__important`)),await s(e.onToggleImportant).toHaveBeenCalled(),await n.click(t.getByTestId(`task-editor__my-day`)),await s(e.onToggleMyDay).toHaveBeenCalled(),await n.click(t.getByTestId(`task-editor__archive`)),await s(e.onArchive).toHaveBeenCalled(),await n.click(t.getByTestId(`task-editor__close`)),await s(e.onClose).toHaveBeenCalled()}},b=[`Default`,`Important`,`Completed`,`NotInMyDay`,`EditTitle`,`EmptyTitleReverts`,`EditTags`,`AddLink`,`ToggleActions`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      important: true,
      notes: "Check the retry logic first."
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      done: true
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      isInMyDay: false,
      due: null,
      remindAt: null,
      links: []
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const title = canvas.getByTestId("task-editor__title");
    await userEvent.clear(title);
    await userEvent.type(title, "Review and merge sync PR{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      title: "Review and merge sync PR"
    });
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const title = canvas.getByTestId("task-editor__title");
    await userEvent.clear(title);
    await userEvent.tab();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(title).toHaveValue(defaultArgs.task.title);
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const tags = canvas.getByTestId("task-editor__tags");
    await userEvent.clear(tags);
    await userEvent.type(tags, "#Acme, team{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      tags: ["acme", "team"]
    });
    await expect(tags).toHaveValue("#acme #team");
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const input = canvas.getByTestId("task-editor__new-link");
    await userEvent.type(input, "not a link{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText("Links must start with http://, https:// or www.")).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, "https://notion.so/spec{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith({
      links: ["https://github.com/acme/gateway-client/pull/412", "https://notion.so/spec"]
    });
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("task-editor__toggle"));
    await expect(args.onToggleDone).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__important"));
    await expect(args.onToggleImportant).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__my-day"));
    await expect(args.onToggleMyDay).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__archive"));
    await expect(args.onArchive).toHaveBeenCalled();
    await userEvent.click(canvas.getByTestId("task-editor__close"));
    await expect(args.onClose).toHaveBeenCalled();
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{v as AddLink,p as Completed,d as Default,_ as EditTags,h as EditTitle,g as EmptyTitleReverts,f as Important,m as NotInMyDay,y as ToggleActions,b as __namedExportsOrder,l as default};