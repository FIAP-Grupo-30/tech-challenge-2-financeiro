import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollProps {
	onLoadMore: () => void;
	isLoading: boolean;
	hasMore: boolean;
	threshold?: number;
}

export function useInfiniteScroll({
	onLoadMore,
	isLoading,
	hasMore,
	threshold = 0.1,
}: UseInfiniteScrollProps) {
	const observerTarget = useRef<HTMLDivElement>(null);
	const [isObserving, setIsObserving] = useState(false);

	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;

			if (entry.isIntersecting && hasMore && !isLoading) {
				onLoadMore();
			}
		},
		[onLoadMore, hasMore, isLoading]
	);

	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, {
			threshold,
			rootMargin: "100px",
		});

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
			setIsObserving(true);
		}

		return () => {
			observer.disconnect();
			setIsObserving(false);
		};
	}, [handleIntersection]);

	return observerTarget;
}
