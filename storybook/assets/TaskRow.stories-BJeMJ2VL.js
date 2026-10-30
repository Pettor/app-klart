import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{c as n,t as r}from"./src-CdQSlvMR.js";import{n as i,t as a}from"./TaskRow-BYawu8IW.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{r(),i(),o=t(),{expect:s,fn:c,waitFor:l,within:u}=__STORYBOOK_MODULE_TEST__,d={component:a,title:`Display/Task Row`,tags:[`autodocs`],decorators:[n]},f={today:`2026-10-21`,isInMyDay:!0,task:{id:`w1`,title:`Review sync PR for gateway client`,done:!1,important:!1,due:`2026-10-21`,remindAt:`2026-10-21T14:00`,tags:[`acme`,`review`],links:[],contextName:`Work`,contextColor:`orange`},onToggleDone:c(),onToggleImportant:c(),onRemoveFromMyDay:c(),onArchive:c()},p={args:f},m={args:{...f,task:{...f.task,title:`Adele Guldpeng`,due:`2026-08-28`,remindAt:null,tags:[`familj`]}}},h={args:{...f,task:{...f.task,important:!0}}},g={args:{...f,task:{...f.task,links:[`https://github.com/acme/gateway-client/pull/412`]}},play:async({canvas:e})=>{let t=e.getByTestId(`task-row__link`);await s(t).toHaveAccessibleName(`Open link to github.com`),await s(t).toHaveAttribute(`href`,`https://github.com/acme/gateway-client/pull/412`),await s(t).toHaveAttribute(`target`,`_blank`),await s(e.queryByTestId(`task-row__links`)).toBeNull()}},_={args:{...f,task:{...f.task,title:`Review sync PR for gateway client and update the release notes before the Friday deploy`,links:[`https://github.com/acme/gateway-client/pull/412`,`https://www.notion.so/acme/Gateway-sync-spec-9f2c`,`https://wiki.acme.dev/release-notes`]}},play:async({canvas:e})=>{await s(e.queryByTestId(`task-row__link`)).toBeNull(),await s(e.getByTestId(`task-row__links`)).toHaveAccessibleName(`3 links`)}},v={args:f,decorators:[e=>(0,o.jsx)(`div`,{className:`slab-tags-on`,children:(0,o.jsx)(e,{})})]},y={args:{...f,task:{...f.task,hasNotes:!0}}},b={args:{...f,onOpen:c(),reorder:{isLifted:!1,offsetY:0,dropIndicator:null,isSettled:!1,rowProps:{onPointerDownCapture:c(),onPointerMoveCapture:c(),onPointerUpCapture:c(),onPointerCancelCapture:c()},gripProps:{onPointerDownCapture:c()},onGripKeyDown:c(),onRowKeyDown:c(),isDropping:()=>!1}},play:async({args:e,canvas:t,userEvent:n})=>{t.getByTestId(`task-row__open`).focus(),await n.keyboard(`{Alt>}{ArrowUp}{/Alt}`),await s(e.reorder.onRowKeyDown).toHaveBeenCalled()}},x={args:{...f,showMeta:!1,showLinks:!1},play:async({canvas:e})=>{await s(e.queryByTestId(`task-row__link`)).toBeNull()}},S={args:{...b.args,reorder:{...b.args.reorder,dropIndicator:`before`}},decorators:[e=>(0,o.jsx)(`div`,{className:`pt-4`,children:(0,o.jsx)(e,{})})]},C={args:{...f,showContext:!0}},w={args:{...f,task:{...f.task,done:!0}}},T={args:{...f,isInMyDay:!1,onAddToMyDay:c()},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:`Add to My Day`})),await s(e.onAddToMyDay).toHaveBeenCalledWith(`w1`)}},E={args:f,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:`Complete task`})),await s(e.onToggleDone).not.toHaveBeenCalled(),await s(t.getByTestId(`task-row`)).toHaveClass(`slab-checking`),await l(()=>s(t.getByTestId(`task-row`).closest(`.slab-leave`)).toHaveClass(`slab-leaving`)),await s(e.onToggleDone).not.toHaveBeenCalled(),await l(()=>s(e.onToggleDone).toHaveBeenCalledWith(`w1`,!0),{timeout:2e3}),await n.click(t.getByRole(`button`,{name:`Mark important`})),await s(e.onToggleImportant).toHaveBeenCalledWith(`w1`)}},D={args:{...f,onOpen:c(),isSelected:!0}},O={args:{...f,onOpen:c()},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:`Edit task: ${f.task.title}`})),await s(e.onOpen).toHaveBeenCalledWith(`w1`)}},k={args:{...f,onOpen:c(),task:{...f.task,title:`Review sync PR for gateway client and update the release notes before the Friday deploy`,important:!0,hasNotes:!0,links:[`https://github.com/acme/gateway-client/pull/412`,`https://wiki.acme.dev/release-notes`]}},globals:{viewport:{value:`iphonex`}},play:async({args:e,canvas:t,userEvent:n})=>{await s(t.queryByTestId(`task-row__link`)).toBeNull(),await s(t.queryByTestId(`task-row__links`)).toBeNull(),await s(t.queryByTestId(`task-row__important`)).toBeNull(),await s(t.queryByRole(`button`,{name:`Task actions`})).toBeNull();let r=t.getByTestId(`task-row__meta`);await s(u(r).getByRole(`img`,{name:`2 links`})).toBeInTheDocument(),await s(u(r).getByRole(`img`,{name:`Has note`})).toBeInTheDocument(),await s(u(r).queryByRole(`img`,{name:`Important`})).toBeNull(),await s(t.getByTestId(`task-row__important-marker`)).toBeInTheDocument(),await n.click(t.getByTestId(`task-row__open`)),await s(e.onOpen).toHaveBeenCalledWith(`w1`)}},A={args:{...f,task:{...f.task,due:null,remindAt:null,tags:[]}},globals:{viewport:{value:`iphonex`}},play:async({canvas:e})=>{await s(e.queryByTestId(`task-row__meta`)).toBeNull()}},j={args:{...f,showMeta:!1,showLinks:!1,showNotes:!1,task:{...f.task,important:!0,hasNotes:!0}},globals:{viewport:{value:`iphonex`}},play:async({canvas:e})=>{await s(e.queryByTestId(`task-row__meta`)).toBeNull(),await s(e.getByTestId(`task-row__important-marker`)).toBeInTheDocument()}},M=[`Default`,`Overdue`,`Important`,`WithLink`,`WithManyLinks`,`TagsShown`,`WithNote`,`Reorderable`,`Minimal`,`DropIndicator`,`WithContext`,`Completed`,`NotInMyDay`,`CompleteAndStar`,`Selected`,`OpenEditor`,`Phone`,`PhoneMinimal`,`PhoneNothingShown`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      title: "Adele Guldpeng",
      due: "2026-08-28",
      remindAt: null,
      tags: ["familj"]
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      important: true
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      links: ["https://github.com/acme/gateway-client/pull/412"]
    }
  },
  play: async ({
    canvas
  }) => {
    const link = canvas.getByTestId("task-row__link");
    await expect(link).toHaveAccessibleName("Open link to github.com");
    await expect(link).toHaveAttribute("href", "https://github.com/acme/gateway-client/pull/412");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(canvas.queryByTestId("task-row__links")).toBeNull();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      title: "Review sync PR for gateway client and update the release notes before the Friday deploy",
      links: ["https://github.com/acme/gateway-client/pull/412", "https://www.notion.so/acme/Gateway-sync-spec-9f2c", "https://wiki.acme.dev/release-notes"]
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
    await expect(canvas.getByTestId("task-row__links")).toHaveAccessibleName("3 links");
  }
}`,..._.parameters?.docs?.source},description:{story:`Two or more links collapse into one button with their count, leaving the title room.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  decorators: [Story => <div className="slab-tags-on">
        <Story />
      </div>]
}`,...v.parameters?.docs?.source},description:{story:'Tags are hidden unless an ancestor has `slab-tags-on`, set by the "Tags on tasks" display option.',...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      hasNotes: true
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    onOpen: fn(),
    reorder: {
      isLifted: false,
      offsetY: 0,
      dropIndicator: null,
      isSettled: false,
      rowProps: {
        onPointerDownCapture: fn(),
        onPointerMoveCapture: fn(),
        onPointerUpCapture: fn(),
        onPointerCancelCapture: fn()
      },
      gripProps: {
        onPointerDownCapture: fn()
      },
      onGripKeyDown: fn(),
      onRowKeyDown: fn(),
      isDropping: () => false
    }
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    canvas.getByTestId("task-row__open").focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await expect(args.reorder!.onRowKeyDown).toHaveBeenCalled();
  }
}`,...b.parameters?.docs?.source},description:{story:"Draggable, from `useTaskReorder`: press the row and drag it with a mouse, or focus its title and press Alt with\narrow up or down. Touch screens show a grip instead.",...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    showMeta: false,
    showLinks: false
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
  }
}`,...x.parameters?.docs?.source},description:{story:`The design's display options off: no dates, reminders or link buttons, just the title.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Reorderable.args!,
    reorder: {
      ...Reorderable.args!.reorder!,
      dropIndicator: "before"
    }
  },
  decorators: [Story => <div className="pt-4">
        <Story />
      </div>]
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    showContext: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      done: true
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    isInMyDay: false,
    onAddToMyDay: fn()
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Add to My Day"
    }));
    await expect(args.onAddToMyDay).toHaveBeenCalledWith("w1");
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Complete task"
    }));
    // The box fills and the check draws first; the task is marked done once that has played.
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await expect(canvas.getByTestId("task-row")).toHaveClass("slab-checking");
    // Then the card sinks away and the list closes the gap.
    await waitFor(() => expect(canvas.getByTestId("task-row").closest(".slab-leave")).toHaveClass("slab-leaving"));
    await expect(args.onToggleDone).not.toHaveBeenCalled();
    await waitFor(() => expect(args.onToggleDone).toHaveBeenCalledWith("w1", true), {
      timeout: 2000
    });
    await userEvent.click(canvas.getByRole("button", {
      name: "Mark important"
    }));
    await expect(args.onToggleImportant).toHaveBeenCalledWith("w1");
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    onOpen: fn(),
    isSelected: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    onOpen: fn()
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: \`Edit task: \${defaultArgs.task.title}\`
    }));
    await expect(args.onOpen).toHaveBeenCalledWith("w1");
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    onOpen: fn(),
    task: {
      ...defaultArgs.task,
      title: "Review sync PR for gateway client and update the release notes before the Friday deploy",
      important: true,
      hasNotes: true,
      links: ["https://github.com/acme/gateway-client/pull/412", "https://wiki.acme.dev/release-notes"]
    }
  },
  globals: {
    viewport: {
      value: "iphonex"
    }
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await expect(canvas.queryByTestId("task-row__link")).toBeNull();
    await expect(canvas.queryByTestId("task-row__links")).toBeNull();
    await expect(canvas.queryByTestId("task-row__important")).toBeNull();
    await expect(canvas.queryByRole("button", {
      name: "Task actions"
    })).toBeNull();
    const meta = canvas.getByTestId("task-row__meta");
    await expect(within(meta).getByRole("img", {
      name: "2 links"
    })).toBeInTheDocument();
    await expect(within(meta).getByRole("img", {
      name: "Has note"
    })).toBeInTheDocument();
    await expect(within(meta).queryByRole("img", {
      name: "Important"
    })).toBeNull();
    await expect(canvas.getByTestId("task-row__important-marker")).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId("task-row__open"));
    await expect(args.onOpen).toHaveBeenCalledWith("w1");
  }
}`,...k.parameters?.docs?.source},description:{story:`Phones: the title takes the width. Links, the star toggle and actions move to the details sheet; a starred task
shows its star at the end of the row. One grey line under the title shows the due date, reminder, link count and
note.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    task: {
      ...defaultArgs.task,
      due: null,
      remindAt: null,
      tags: []
    }
  },
  globals: {
    viewport: {
      value: "iphonex"
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("task-row__meta")).toBeNull();
  }
}`,...A.parameters?.docs?.source},description:{story:`With nothing under the title, a phone row is a single line.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    showMeta: false,
    showLinks: false,
    showNotes: false,
    task: {
      ...defaultArgs.task,
      important: true,
      hasNotes: true
    }
  },
  globals: {
    viewport: {
      value: "iphonex"
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("task-row__meta")).toBeNull();
    await expect(canvas.getByTestId("task-row__important-marker")).toBeInTheDocument();
  }
}`,...j.parameters?.docs?.source},description:{story:`Every display option off: a starred task with a note keeps its star at the end, and nothing under the title.`,...j.parameters?.docs?.description}}}})))()}N();export{E as CompleteAndStar,w as Completed,p as Default,S as DropIndicator,h as Important,x as Minimal,T as NotInMyDay,O as OpenEditor,m as Overdue,k as Phone,A as PhoneMinimal,j as PhoneNothingShown,b as Reorderable,D as Selected,v as TagsShown,C as WithContext,g as WithLink,_ as WithManyLinks,y as WithNote,M as __namedExportsOrder,d as default};