/** Public surface of the Arifcard design system. See docs/design-system.md. */
export { ThemeProvider, useTheme } from "./theme/ThemeProvider.jsx";
export { AppShell, BrandMark } from "./layout/AppShell.jsx";

export { Button, buttonClasses } from "./components/Button.jsx";
export { Panel } from "./components/Panel.jsx";
export { StatusPill, Badge } from "./components/Badge.jsx";
export { Spinner } from "./components/Spinner.jsx";
export { Skeleton, SkeletonText } from "./components/Skeleton.jsx";
export { EmptyState } from "./components/EmptyState.jsx";
export { ErrorState, OfflineState } from "./components/ErrorState.jsx";
export { DemoNotice } from "./components/DemoNotice.jsx";
export { ToastProvider, useToast } from "./components/Toast.jsx";
export { Dialog } from "./components/Dialog.jsx";
export { Drawer } from "./components/Drawer.jsx";
export { Dropdown } from "./components/Dropdown.jsx";
export { Tooltip } from "./components/Tooltip.jsx";
export { Table } from "./components/Table.jsx";
export { Pagination } from "./components/Pagination.jsx";
export { Field, TextInput, SelectInput, TextArea, Checkbox, Switch } from "./components/Field.jsx";
export { FileField } from "./components/FileField.jsx";
export { SearchableSelect } from "./components/SearchableSelect.jsx";
export { Stepper } from "./components/Stepper.jsx";
export { StepIndicator } from "./components/StepIndicator.jsx";
export { Timeline } from "./components/Timeline.jsx";
export { Tabs, TabPanel } from "./components/Tabs.jsx";
export { StatCard } from "./components/StatCard.jsx";
export { PageHeader } from "./components/PageHeader.jsx";
export { MoneyValue, useTicking } from "./components/MoneyValue.jsx";
export { VirtualCard } from "./components/VirtualCard.jsx";
export { BarChart, LineChart } from "./components/Charts.jsx";

export { prepareImage, formatBytes, isAcceptedImage } from "./lib/image.js";
export { formatMoney, timeAgo, formatDate, formatDateTime } from "./lib/format.js";
export { useFocusTrap } from "./lib/useFocusTrap.js";
