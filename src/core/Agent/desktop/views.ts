export default class DesktopState {
  constructor(
    public activeApp: string,
    public apps: string,
    public interactiveElements: string,
    public scrollableElements: string
  ) {}
}

export type DesktopStateResponse = {
  activeApp: string;
  apps: string;
  interactiveElements: string;
  scrollableElements: string;
};
