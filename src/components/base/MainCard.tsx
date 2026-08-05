import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  type CardProps,
} from "@mui/material";
import type { ReactNode } from "react";

export interface MainCardProps extends Omit<CardProps, "title"> {
  title?: ReactNode;
  subheader?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  contentSx?: CardProps["sx"];
  children: ReactNode;
}

export function MainCard({
  title,
  subheader,
  action,
  footer,
  contentSx,
  children,
  sx,
  ...cardProps
}: MainCardProps) {
  return (
    <Card
      {...cardProps}
      sx={{
        border: 1,
        borderColor: "divider",
        boxShadow: "none",
        overflow: "visible",
        ...sx,
      }}
    >
      {title && (
        <>
          <CardHeader
            title={title}
            subheader={subheader}
            action={action}
            titleTypographyProps={{ component: "div" }}
            subheaderTypographyProps={{ component: "div" }}
            sx={{
              px: { xs: 2.5, md: 3.5 },
              py: 2.5,
              "& .MuiCardHeader-action": { m: 0, alignSelf: "center" },
            }}
          />
          <Divider />
        </>
      )}
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, ...contentSx }}>
        {children}
      </CardContent>
      {footer && (
        <>
          <Divider />
          <CardActions sx={{ px: { xs: 2.5, md: 3.5 }, py: 2 }}>
            {footer}
          </CardActions>
        </>
      )}
    </Card>
  );
}
