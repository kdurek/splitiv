import { Skeleton } from "@chakra-ui/react";
import React from "react";

function SkeletonWrapper({ children, isLoaded }) {
  return <Skeleton isLoaded={isLoaded}>{isLoaded && children}</Skeleton>;
}

export default SkeletonWrapper;
