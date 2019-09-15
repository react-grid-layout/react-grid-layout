// @flow
// flow-typed signature: 3fba12a77525f37b0492c8dab3e04f0e
// flow-typed version: 94e9f7e0a4/classnames_v2.x.x/flow_>=v0.28.x

type $npm$classnames$Classes =
  | string
  | { [className: string]: ?boolean }
  | Array<string>
  | void
  | null;

declare module "classnames" {
  declare module.exports: (
    ...classes: Array<$npm$classnames$Classes>
  ) => string;
}
