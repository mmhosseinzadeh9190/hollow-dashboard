import {
  ClipboardText,
  Clock,
  CloseSquare,
  Code,
  TickSquare,
} from "iconsax-react";
import Button from "./Button";
import { ReactNode, useEffect, useState } from "react";
import Modal from "./Modal";
import { User } from "../services/apiUsers";
import { Activity } from "../services/apiActivity";
import PreMadeButtons from "./PreMadeButtons";
import { Project } from "../services/apiProjects";
import {
  capitalizeFirstLetter,
  daysUntil,
  formatISODateToCustomFormat,
} from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../services/supabase";

type TaskListProps = {
  user: User;
  activities: Activity[];
  projects: Project[];
  onActivitiesUpdated: () => void;
  onProjectsUpdated: () => void;
};

function TaskList({
  user,
  activities,
  projects,
  onActivitiesUpdated,
  onProjectsUpdated,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userTasks = activities.filter(
      (activity) =>
        activity.user_id === String(user.id) && activity.type === "task",
    );

    const doneTaskContents = new Set(
      projects
        .filter((project) =>
          userTasks.some((task) => task.project_id === project.id),
        )
        .flatMap((project) => project.tasks_done || []),
    );

    const sortedTasks = userTasks.sort((a, b) => {
      const isADone = a.content?.[0] && doneTaskContents.has(a.content[0]);
      const isBDone = b.content?.[0] && doneTaskContents.has(b.content[0]);

      if (isADone === isBDone) return 0;
      if (!isADone) return -1;
      return 1;
    });

    setTasks(sortedTasks);
  }, [activities, projects, user.id]);

  const handleOpenModal = (content: ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleTaskCompletion = async (task: Activity, project: Project) => {
    try {
      setIsSubmitting(true);

      const completedTasks = [...project.tasks_done!, ...task.content!];
      const isProjectDone = project.tasks?.length === completedTasks.length;
      const updatedProject = {
        tasks_done: [...completedTasks],
        status: isProjectDone ? "done" : project.status,
      };

      const { error } = await supabase
        .from("projects")
        .update(updatedProject)
        .eq("id", project.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Task completed successfully!");
      onActivitiesUpdated();
      onProjectsUpdated();
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to complete task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskListContent = (
    <div className="flex max-h-xl w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-roboto text-xl font-medium tracking-0.1 text-gray-900">
          Tasks
        </h2>

        <Button
          onClick={handleCloseModal}
          className="text-gray-600 hover:text-gray-700"
        >
          <CloseSquare size="20" />
        </Button>
      </div>

      <div className="-mr-8 flex flex-col overflow-y-scroll pr-7">
        {tasks.map((task) => {
          const project = projects.find(
            (project) => project.id === task.project_id,
          );
          if (!project) return;

          const isTaskDone = project?.tasks_done?.includes(task.content![0]);
          const daysLeft = daysUntil(task.timestamp!);
          let textColor = "text-gray-700",
            bgColor = "bg-gray-200";

          if (daysLeft <= 7) {
            (textColor = "text-warning-600"), (bgColor = "bg-warning-50");
          }
          if (daysLeft <= 3) {
            (textColor = "text-error-600"), (bgColor = "bg-error-50");
          }
          if (isTaskDone) {
            (textColor = "text-gray-700"), (bgColor = "bg-gray-200");
          }

          return (
            <div
              className="flex flex-col gap-1 border-b-2 border-dashed border-gray-200 py-4 first-of-type:pt-0 last-of-type:border-b-0 last-of-type:pb-0"
              key={task.id}
            >
              <p className="truncate font-roboto font-medium tracking-0.1 text-gray-900">
                {capitalizeFirstLetter(task.content![0])}
              </p>
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <Code size="16" className="text-gray-600" />
                    <span
                      onClick={() => {
                        handleCloseModal();
                        navigate(`/projects/${project?.id}`);
                      }}
                      className="max-w-96 cursor-pointer truncate font-roboto text-sm font-medium capitalize tracking-0.1 text-primary-800 hover:text-primary-900 hover:underline"
                    >
                      {project?.name!}
                    </span>
                  </span>
                  <span
                    className={`flex w-max items-center gap-1 rounded-md px-2 py-1 font-roboto text-sm tracking-0.1 ${textColor} ${bgColor}`}
                  >
                    <Clock size="16" />
                    {formatISODateToCustomFormat(task.timestamp!)}
                  </span>
                </div>
                {isTaskDone ? (
                  <span className="flex cursor-default items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2.5">
                    <TickSquare size="16" className="text-gray-600" />
                    <span className="text-sm font-medium tracking-0.1 text-gray-700">
                      Done
                    </span>
                  </span>
                ) : (
                  <PreMadeButtons
                    type="confirm"
                    text="Complete"
                    onClick={() => handleTaskCompletion(task, project!)}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Button
        onClick={() => {
          handleOpenModal(taskListContent);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-200"
      >
        <ClipboardText size="20" className="text-primary-800" />
      </Button>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalContent}
      </Modal>
    </>
  );
}

export default TaskList;
