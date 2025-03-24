deploy:
	@echo "Deploying changes..."

	# Checkout the dev branch and push changes
	git checkout dev || (echo "Failed to checkout dev branch" && exit 1)
	git push origin dev || (echo "Failed to push dev branch" && exit 1)

	# Checkout the main branch, merge dev, and push
	git checkout main || (echo "Failed to checkout main branch" && exit 1)
	git merge dev || (echo "Failed to merge dev branch. Resolve conflicts if any." && exit 1)
	git push origin main || (echo "Failed to push main branch" && exit 1)

	# Checkout back to the dev branch
	git checkout dev || (echo "Failed to checkout dev branch" && exit 1)

	@echo "Deployment complete."
