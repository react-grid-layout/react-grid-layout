// flow-typed signature: e5943b73ab5a7e87ce78d833ac522e54
// flow-typed version: a913c9ae5a/classnames_v2.x.x/flow_>=v0.104.x

type $npm$classnames$Classes =
  | string
  | number
  | { [className: string]: *, ... }
  | boolean
  | void
  | null
  | $ReadOnlyArray<$npm$classnames$Classes>;

declare module "classnames" {
  declare module.exports: (
    ...classes: Array<$npm$classnames$Classes>
  ) => string;
}

declare module "classnames/bind" {
  declare module.exports: $Exports<"classnames">;
}

declare module "classnames/dedupe" {
  declare module.exports: $Exports<"classnames">;
}
