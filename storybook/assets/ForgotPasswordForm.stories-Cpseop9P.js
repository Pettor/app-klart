import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{a as t,i as n,r}from"./react-intl-A4R07ucy.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./button-BrFzn3Nr.js";import{n as s,t as c}from"./spinner-OeagCd1s.js";import{c as l,t as u}from"./src-CdQSlvMR.js";import{i as d,n as f,r as p,t as m}from"./FormValidation--6FkDIYK.js";import{a as h,i as g,n as _,o as v,r as y,t as b}from"./InputField-D3AP-NPS.js";import{i as x,s as S}from"./schemas-B2dn2uYH.js";var C;function w(){return(w=e((()=>{r(),C=t({emailLabel:{description:`ForgotPasswordForm: label - email input`,defaultMessage:`Email`,id:`zoMR5Z`},submitAriaLabel:{description:`ForgotPasswordForm: aria-label - submit button`,defaultMessage:`Submit`,id:`UF/bNZ`},submit:{description:`ForgotPasswordForm: button - submit send`,defaultMessage:`Send`,id:`ov7hhw`}})})))()}function T({loading:e,onSubmit:t}){let r=n(),{emailSchema:i}=f(),a=S({email:i}),s=g({defaultValues:{email:``},validators:{onSubmit:a},onSubmit:async({value:e})=>{t(e)}});return(0,E.jsxs)(p,{onSubmit:e=>{e.preventDefault(),e.stopPropagation(),s.handleSubmit()},className:`flex w-full flex-col justify-center gap-4`,children:[(0,E.jsx)(s.Field,{name:`email`,children:e=>(0,E.jsx)(b,{autoFocus:!0,field:e,type:`email`,fullWidth:!0,label:r.formatMessage(C.emailLabel),startContent:(0,E.jsx)(h,{className:`h-5 w-5`}),"data-testid":`forgot-password-form__email-input`})}),(0,E.jsx)(s.Subscribe,{selector:e=>[e.canSubmit],children:([t])=>(0,E.jsx)(o,{isDisabled:!t||e,variant:`primary`,type:`submit`,size:`lg`,className:`mt-2 w-full`,"aria-label":r.formatMessage(C.submitAriaLabel),"data-testid":`forgot-password-form__submit-button`,children:e?(0,E.jsx)(c,{size:`sm`}):r.formatMessage(C.submit)})})]})}var E;function D(){return(D=e((()=>{v(),a(),d(),s(),y(),r(),x(),m(),w(),_(),E=i(),T.__docgenInfo={description:``,methods:[],displayName:`ForgotPasswordForm`,props:{loading:{required:!0,tsType:{name:`boolean`},description:``},onSubmit:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(data: FormForgotPassword) => void`,signature:{arguments:[{type:{name:`FormForgotPassword`},name:`data`}],return:{name:`void`}}},description:``}}}})))()}var O,k,A,j,M,N,P;function F(){return(F=e((()=>{u(),D(),{expect:O}=__STORYBOOK_MODULE_TEST__,k={component:T,title:`Forms/Forgot Password`,decorators:[l],parameters:{a11y:{config:{rules:[{id:`color-contrast`,enabled:!1}]}}}},A={loading:!1,onSubmit:()=>console.log(`onSubmit`)},j={args:A},M={args:A,play:async({canvas:e,userEvent:t})=>{await t.type(e.getByTestId(`forgot-password-form__email-input`),`email@provider.com`),await t.click(e.getByTestId(`forgot-password-form__submit-button`)),await O(e.getByTestId(`forgot-password-form__email-input`)).toHaveValue(`email@provider.com`)}},N={args:A,play:async({canvas:e,userEvent:t})=>{await t.click(e.getByTestId(`forgot-password-form__submit-button`)),await O(e.getByText(`Email must be valid`)).toBeInTheDocument()}},P=[`Standard`,`Success`,`IncorrectEmail`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.type(canvas.getByTestId("forgot-password-form__email-input"), "email@provider.com");
    await userEvent.click(canvas.getByTestId("forgot-password-form__submit-button"));
    await expect(canvas.getByTestId("forgot-password-form__email-input")).toHaveValue("email@provider.com");
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByTestId("forgot-password-form__submit-button"));
    await expect(canvas.getByText("Email must be valid")).toBeInTheDocument();
  }
}`,...N.parameters?.docs?.source}}}})))()}F();export{N as IncorrectEmail,j as Standard,M as Success,P as __namedExportsOrder,k as default};