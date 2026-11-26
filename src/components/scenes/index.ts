import type { ComponentType } from "react";
import type { SceneProps } from "./utils";
import IceScene from "./IceScene";
import MountainScene from "./MountainScene";
import CandleScene from "./CandleScene";
import SeaScene from "./SeaScene";
import SnailScene from "./SnailScene";
import TreeScene from "./TreeScene";
import MilkTeaScene from "./MilkTeaScene";
import BatteryScene from "./BatteryScene";
import EggScene from "./EggScene";
import SunsetScene from "./SunsetScene";
import PizzaScene from "./PizzaScene";

export const SCENES: Record<string, ComponentType<SceneProps>> = {
  "da-tan": IceScene,
  "ngu-cong-doi-nui": MountainScene,
  "tat-can-bien-dong": SeaScene,
  "nen-chay": CandleScene,
  "oc-sen-ve-nha": SnailScene,
  "cay-lon": TreeScene,
  "tra-sua": MilkTeaScene,
  "het-pin": BatteryScene,
  "trung-no": EggScene,
  "mat-troi-lan": SunsetScene,
  pizza: PizzaScene,
};

export type { SceneProps };
