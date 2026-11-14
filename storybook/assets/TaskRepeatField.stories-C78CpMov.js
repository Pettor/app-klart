import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./TaskRepeatField-C4Ze3N_T.js";import{c as r,t as i}from"./src-axRF29CE.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{i(),t(),{expect:a,fn:o,screen:s,within:c}=__STORYBOOK_MODULE_TEST__,l={component:n,title:`Input/Task Repeat Field`,tags:[`autodocs`],decorators:[r]},u={repeat:null,due:`2026-10-21`,today:`2026-10-21`,onChange:o(),className:`ctx-orange`},d={args:u},f={args:{...u,repeat:{every:1,unit:`week`,weekdays:[3],from:`2026-10-21`}},play:async({canvas:e})=>{await a(e.getByTestId(`task-repeat__summary`)).toHaveTextContent(`Every week on Wed`),await a(e.queryByTestId(`task-repeat__custom`)).not.toBeInTheDocument()}},p={args:{...u,repeat:{every:2,unit:`week`,weekdays:[1,4],from:`2026-10-19`}},play:async({args:e,canvas:t,userEvent:n})=>{await a(t.getByTestId(`task-repeat__summary`)).toHaveTextContent(`Every 2 weeks on Mon and Thu`),await n.click(t.getByTestId(`task-repeat__weekday-5`)),await a(e.onChange).toHaveBeenCalledWith({repeat:{every:2,unit:`week`,weekdays:[1,4,5],from:`2026-10-19`}})}},m={args:{...u,repeat:{every:1,unit:`month`,weekdays:[],from:`2026-10-31`}}},h={args:u,play:async({args:e,canvas:t,userEvent:n})=>{await n.click(c(t.getByTestId(`task-repeat__preset`)).getByRole(`button`)),await n.click(await s.findByRole(`option`,{name:`Weekly`})),await a(e.onChange).toHaveBeenCalledWith({repeat:{every:1,unit:`week`,weekdays:[3],from:`2026-10-21`}})}},g={args:{...u,due:null,today:`2026-10-24`},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(c(t.getByTestId(`task-repeat__preset`)).getByRole(`button`)),await n.click(await s.findByRole(`option`,{name:`Weekdays`})),await a(e.onChange).toHaveBeenCalledWith({repeat:{every:1,unit:`week`,weekdays:[1,2,3,4,5],from:`2026-10-26`},due:`2026-10-26`})}},_={args:{...u,repeat:{every:1,unit:`day`,weekdays:[],from:`2026-10-21`}},play:async({args:e,canvas:t,userEvent:n})=>{await n.click(c(t.getByTestId(`task-repeat__preset`)).getByRole(`button`)),await n.click(await s.findByRole(`option`,{name:`Doesn't repeat`})),await a(e.onChange).toHaveBeenCalledWith({repeat:null})}},v=[`DoesNotRepeat`,`Weekly`,`Custom`,`Monthly`,`PickWeekly`,`PickWeekdaysWithoutDueDate`,`StopRepeating`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    repeat: {
      every: 1,
      unit: "week",
      weekdays: [3],
      from: "2026-10-21"
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("task-repeat__summary")).toHaveTextContent("Every week on Wed");
    await expect(canvas.queryByTestId("task-repeat__custom")).not.toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    repeat: {
      every: 2,
      unit: "week",
      weekdays: [1, 4],
      from: "2026-10-19"
    }
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await expect(canvas.getByTestId("task-repeat__summary")).toHaveTextContent("Every 2 weeks on Mon and Thu");
    await userEvent.click(canvas.getByTestId("task-repeat__weekday-5"));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: {
        every: 2,
        unit: "week",
        weekdays: [1, 4, 5],
        from: "2026-10-19"
      }
    });
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    repeat: {
      every: 1,
      unit: "month",
      weekdays: [],
      from: "2026-10-31"
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", {
      name: "Weekly"
    }));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: {
        every: 1,
        unit: "week",
        weekdays: [3],
        from: "2026-10-21"
      }
    });
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  // 2026-10-24 is a Saturday, so the first weekday is Monday the 26th.
  args: {
    ...defaultArgs,
    due: null,
    today: "2026-10-24"
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", {
      name: "Weekdays"
    }));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: {
        every: 1,
        unit: "week",
        weekdays: [1, 2, 3, 4, 5],
        from: "2026-10-26"
      },
      due: "2026-10-26"
    });
  }
}`,...g.parameters?.docs?.source},description:{story:`A task without a due date becomes due on the rule's first date.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    repeat: {
      every: 1,
      unit: "day",
      weekdays: [],
      from: "2026-10-21"
    }
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(within(canvas.getByTestId("task-repeat__preset")).getByRole("button"));
    await userEvent.click(await screen.findByRole("option", {
      name: "Doesn't repeat"
    }));
    await expect(args.onChange).toHaveBeenCalledWith({
      repeat: null
    });
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{p as Custom,d as DoesNotRepeat,m as Monthly,g as PickWeekdaysWithoutDueDate,h as PickWeekly,_ as StopRepeating,f as Weekly,v as __namedExportsOrder,l as default};