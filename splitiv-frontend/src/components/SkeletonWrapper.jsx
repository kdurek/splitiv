import { Skeleton } from "@chakra-ui/react";
import { bool, node } from "prop-types";

function SkeletonWrapper({ children, isLoaded }) {
  return <Skeleton isLoaded={isLoaded}>{isLoaded && children}</Skeleton>;
}

SkeletonWrapper.propTypes = {
  children: node.isRequired,
  isLoaded: bool.isRequired,
};

export default SkeletonWrapper;
