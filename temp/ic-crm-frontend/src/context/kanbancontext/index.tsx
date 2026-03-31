import React, { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { TodoCategory } from '../../types/apps/kanban';
import { deleteFetcher, getFetcher, postFetcher } from 'src/api/globalFetcher';
import { crmSwrOptions } from 'src/lib/swrOptions';
import useSWR, { mutate as mutateCache } from 'swr';

interface KanbanDataContextProps {
    children: ReactNode;
}

interface KanbanContextType {
    todoCategories: TodoCategory[];
    addCategory: (categoryName: string) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    clearAllTasks: (categoryId: string) => Promise<void>;
    deleteTodo: (taskId: number) => Promise<void>;
    setError: (errorMessage: any) => void;
    loading: boolean;
    error: unknown;
    setTodoCategories: Dispatch<SetStateAction<TodoCategory[]>>;
    moveTask: (
        taskId: number,
        sourceCategoryId: string,
        destinationCategoryId: string,
        sourceIndex: number,
        destinationIndex: number
    ) => void;
}

export const KanbanDataContext = createContext<KanbanContextType>({} as KanbanContextType);

const KANBAN_KEY = '/api/kanban';

const isRecord = (value: unknown): value is Record<string, any> =>
    typeof value === 'object' && value !== null;

const normalizeCategory = (value: unknown): TodoCategory | null => {
    if (!isRecord(value) || value.id == null) {
        return null;
    }

    const child = Array.isArray(value.child)
        ? value.child
        : Array.isArray(value.tasks)
            ? value.tasks
            : Array.isArray(value.items)
                ? value.items
                : [];

    return {
        ...value,
        id: value.id,
        name: typeof value.name === 'string' ? value.name : String(value.title ?? ''),
        child,
    } as TodoCategory;
};

const extractCategoryArray = (payload: unknown): TodoCategory[] | null => {
    const rawCategories = Array.isArray(payload)
        ? payload
        : isRecord(payload) && Array.isArray(payload.data)
            ? payload.data
            : null;

    if (!rawCategories) {
        return null;
    }

    return rawCategories
        .map((category) => normalizeCategory(category))
        .filter((category): category is TodoCategory => Boolean(category));
};

const extractSingleCategory = (payload: unknown): TodoCategory | null => {
    const candidate = isRecord(payload) && !Array.isArray(payload.data) && payload.data !== undefined
        ? payload.data
        : payload;

    return normalizeCategory(candidate);
};

const buildKanbanCachePayload = (categories: TodoCategory[], payload?: unknown) => {
    const source = isRecord(payload) ? payload : {};

    return {
        ...source,
        status: typeof source.status === 'number' ? source.status : 200,
        msg: typeof source.msg === 'string' ? source.msg : 'success',
        data: categories,
    };
};

export const KanbanDataContextProvider: React.FC<KanbanDataContextProps> = ({ children }) => {
    const [todoCategories, setTodoCategories] = useState<TodoCategory[]>([]);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true)

    // Fetch todo data from the API
    const { data: todosData, isLoading: isTodosLoading, error: todoError } = useSWR(KANBAN_KEY, getFetcher, crmSwrOptions)
    useEffect(() => {
        if (todosData) {
            const nextCategories = extractCategoryArray(todosData);
            if (nextCategories) {
                setTodoCategories(nextCategories);
                setError(null);
            } else {
                setError(new Error('Invalid Kanban data received from the server.'));
            }
            setLoading(isTodosLoading);
        } else if (todoError) {
            setError(todoError);
            setLoading(isTodosLoading);
        } else {
            setLoading(isTodosLoading);
        }
    }, [todosData, todoError, isTodosLoading]);

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const replaceCategories = (categories: TodoCategory[], payload?: unknown) => {
        setTodoCategories(categories);
        void mutateCache(KANBAN_KEY, buildKanbanCachePayload(categories, payload), false);
    };

    const revalidateCategories = async () => {
        await mutateCache(KANBAN_KEY);
    };

    const deleteCategory = async (categoryId: string) => {
        try {
            const response = await deleteFetcher('/api/kanban/delete-category', { categoryId, id: categoryId });
            const nextCategories = extractCategoryArray(response);
            if (nextCategories) {
                replaceCategories(nextCategories, response);
            } else {
                await revalidateCategories();
            }
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const clearAllTasks = async (categoryId: string) => {
        try {
            const response = await deleteFetcher('/api/TodoData/clearTasks', { categoryId });
            const nextCategories = extractCategoryArray(response);
            if (nextCategories) {
                replaceCategories(nextCategories, response);
            } else {
                await revalidateCategories();
            }
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const addCategory = async (categoryName: string) => {
        try {
            const response = await postFetcher('/api/kanban/add-category', { categoryName });
            const nextCategories = extractCategoryArray(response);
            if (nextCategories) {
                replaceCategories(nextCategories, response);
                return;
            }

            const newCategory = extractSingleCategory(response);
            if (newCategory) {
                const updatedCategories = [
                    ...todoCategories.filter((category) => String(category.id) !== String(newCategory.id)),
                    newCategory,
                ];
                replaceCategories(updatedCategories, response);
                return;
            }

            await revalidateCategories();
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const deleteTodo = async (taskId: number) => {
        try {
            const response = await deleteFetcher('/api/TodoData/deleteTask', { taskId });
            const nextCategories = extractCategoryArray(response);
            if (nextCategories) {
                replaceCategories(nextCategories, response);
            } else {
                await revalidateCategories();
            }
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const moveTask = (_: any, sourceCategoryId: any, destinationCategoryId: any, sourceIndex: number, destinationIndex: number) => {

        const previousCategories = todoCategories;

        setTodoCategories((prevCategories) => {
            // Find the source and destination categories
            const sourceCategoryIndex = prevCategories.findIndex(cat => cat.id.toString() === sourceCategoryId);
            const destinationCategoryIndex = prevCategories.findIndex(cat => cat.id.toString() === destinationCategoryId);

            if (sourceCategoryIndex === -1 || destinationCategoryIndex === -1) {
                return prevCategories; // Return previous state if categories are not found
            }
            // Clone the source and destination categories
            const updatedCategories = prevCategories.map((category) => ({
                ...category,
                child: [...category.child],
            }));
            const sourceCategory = { ...updatedCategories[sourceCategoryIndex], child: [...updatedCategories[sourceCategoryIndex].child] };
            const destinationCategory = sourceCategoryIndex === destinationCategoryIndex
                ? sourceCategory
                : { ...updatedCategories[destinationCategoryIndex], child: [...updatedCategories[destinationCategoryIndex].child] };

            // Remove the task from the source category
            const taskToMove = sourceCategory.child.splice(sourceIndex, 1)[0];
            if (!taskToMove) {
                return prevCategories;
            }

            // Insert the task into the destination category at the specified index
            destinationCategory.child.splice(destinationIndex, 0, taskToMove);

            // Update the categories in the state
            updatedCategories[sourceCategoryIndex] = sourceCategory;
            updatedCategories[destinationCategoryIndex] = destinationCategory;

            return updatedCategories;
        });

        postFetcher('/api/kanban/move-task', {
                taskId: String(_),
                sourceCategoryId,
                destinationCategoryId,
                sourceIndex,
                destinationIndex,
            })
            .then((response: any) => {
                const nextCategories = extractCategoryArray(response);
                if (nextCategories) {
                    replaceCategories(nextCategories, response);
                } else {
                    void revalidateCategories();
                }
            })
            .catch((error: any) => {
                setTodoCategories(previousCategories);
                void mutateCache(KANBAN_KEY, buildKanbanCachePayload(previousCategories), false);
                handleError(error);
            });
    };

    return (
        <KanbanDataContext.Provider value={{ todoCategories, loading, error, setTodoCategories, addCategory, deleteCategory, clearAllTasks, deleteTodo, setError, moveTask }}>
            {children}
        </KanbanDataContext.Provider>
    );
};
