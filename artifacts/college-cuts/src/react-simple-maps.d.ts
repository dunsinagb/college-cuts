declare module "react-simple-maps" {
  import { ReactNode, SVGProps, MouseEvent } from "react";

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    children?: ReactNode;
  }
  export const ComposableMap: React.ForwardRefExoticComponent<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }
  export const Geographies: React.FC<GeographiesProps>;

  export interface Geography {
    rsmKey: string;
    properties: Record<string, string>;
    geometry: object;
    type: string;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: Geography;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }
  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export const Marker: React.FC<MarkerProps>;
}
