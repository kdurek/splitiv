deploy:
	@echo "Deploying changes..."

	# Checkout the dev branch and push changes
	@echo ""
	@echo "Checking out dev branch..."
	git checkout dev || (echo "Failed to checkout dev branch" && exit 1)

	@echo ""
	@echo "Pushing to dev branch..."
	git push origin dev || (echo "Failed to push dev branch" && exit 1)

	# Checkout the main branch, merge dev, and push
	@echo ""
	@echo "Checking out main branch..."
	git checkout main || (echo "Failed to checkout main branch" && exit 1)

	@echo ""
	@echo "Merging dev into main..."
	git merge dev || (echo "Failed to merge dev branch. Resolve conflicts if any." && exit 1)

	@echo ""
	@echo "Pushing to main branch..."
	git push origin main || (echo "Failed to push main branch" && exit 1)

	# Checkout back to the dev branch
	@echo ""
	@echo "Returning to dev branch..."
	git checkout dev || (echo "Failed to checkout dev branch" && exit 1)

	@echo ""
	@echo "Deployment complete."
