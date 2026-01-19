export interface NavigationMenuItem {
    title: string;
    path: string;
    icon: string;
}

export interface NavigationMenuGroup {
    title: string;
    items: NavigationMenuItem[];
}
