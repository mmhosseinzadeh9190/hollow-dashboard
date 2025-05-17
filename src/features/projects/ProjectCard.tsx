import { ReactNode, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  Paperclip2,
  TickSquare,
  Edit,
  Eye,
  Trash,
  TimerStart,
  TextalignLeft,
} from "iconsax-react";
import { iconColor } from "../../styles/GlobalStyles";
import {
  addDefaultSrc,
  capitalizeAllFirstLetters,
  capitalizeFirstLetter,
  daysUntil,
} from "../../utils/helpers";
import ProgressBar from "../../ui/ProgressBar";
import { Project } from "../../services/apiProjects";
import { useTeams } from "../dashboard/useTeams";
import { useUsers } from "../dashboard/useUsers";
import { useUser } from "../authentication/useUser";
import Spinner from "../../ui/Spinner";
import CustomDropdown from "../../ui/CustomDropdown";
import Modal from "../../ui/Modal";
import DeleteProjectModalContent from "./DeleteProjectModalContent";
import StartProjectModalContent from "./StartProjectModalContent";
import { useProjects } from "./useProjects";
import CompleteProjectModalContent from "./CompleteProjectModalContent";

interface ProjectCardProps {
  project: Project;
  fullHeight?: boolean;
}

function ProjectCard({ project, fullHeight }: ProjectCardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const { user } = useUser();
  const { teams, isLoading: teamsIsLoading, error: teamsError } = useTeams();
  const { users, isLoading: usersIsLoading, error: usersError } = useUsers();
  const { refetch: projectsRefetch } = useProjects();

  if (teamsIsLoading || usersIsLoading) return <Spinner />;

  const handleOpenModal = (content: ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const teamMembers = teams?.data?.find(
    (team) => team.id === project.team,
  )?.members;

  const placeholderAvatar = "/public/avatarPlaceholder.png";

  const daysLeft = daysUntil(project.deadline!);

  const deadlineText = daysLeft < 0 ? "days past" : "days left";

  let textColor = "text-gray-700",
    bgColor = "bg-gray-200";

  if (daysLeft <= 7) {
    textColor = "text-warning-600";
    bgColor = "bg-warning-50";
  }

  if (daysLeft <= 3) {
    textColor = "text-error-600";
    bgColor = "bg-error-50";
  }

  const dropdownItems = [
    {
      icon: <Eye size="16" variant="Linear" />,
      label: "See details",
      onClick: () => navigate(`/projects/${project.id}`),
    },
  ];

  if (user?.id === project.created_by) {
    dropdownItems.push(
      {
        icon: <Edit size="16" variant="Linear" />,
        label: "Edit",
        onClick: () => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("edit", "true");
          navigate(`/projects/${project.id}?${newSearchParams.toString()}`);
        },
      },
      {
        icon: <Trash size="16" variant="Linear" />,
        label: "Delete",
        onClick: () =>
          handleOpenModal(
            <DeleteProjectModalContent
              project={project}
              teams={teams?.data!}
              onClose={handleCloseModal}
            />,
          ),
      },
    );
  }

  if (user?.id === project.created_by && project.status === "pending") {
    dropdownItems.push({
      icon: <TimerStart size="16" variant="Linear" />,
      label: "Start",
      onClick: () =>
        handleOpenModal(
          <StartProjectModalContent
            project={project}
            onProjectUpdated={projectsRefetch}
            onClose={handleCloseModal}
          />,
        ),
    });
  }

  if (user?.id === project.created_by && project.status === "run") {
    dropdownItems.push({
      icon: <TickSquare size="16" variant="Linear" />,
      label: "Done",
      onClick: () =>
        handleOpenModal(
          <CompleteProjectModalContent
            project={project}
            onProjectUpdated={projectsRefetch}
            onClose={handleCloseModal}
          />,
        ),
    });
  }

  const projectDescription =
    capitalizeFirstLetter(project.description!) ||
    "There is no description for this project!";

  return (
    <div
      className={`flex ${fullHeight && "min-w-96 overflow-y-auto"} flex-col gap-1.5 rounded-2.5xl bg-white p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3
          className={`truncate text-sm font-semibold tracking-0.1 text-gray-900 ${
            project.status === "done" ? "line-through" : ""
          }`}
        >
          {capitalizeAllFirstLetters(project.name!)}
        </h3>

        <CustomDropdown
          items={dropdownItems.map((item) => ({
            ...item,
            onClick: item.onClick,
          }))}
        />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {modalContent}
        </Modal>
      </div>

      {teams?.data?.map(
        (team) =>
          team.id === project.team && (
            <div
              key={team.id}
              className="font-roboto text-sm tracking-0.1 text-gray-700"
            >
              {capitalizeFirstLetter(team.name!)}
            </div>
          ),
      )}

      <div
        className={`flex gap-5 ${project.status === "done" ? "mt-4" : "mt-2"}`}
      >
        <span className="flex items-center gap-1 font-roboto text-sm tracking-0.1 text-gray-600">
          <Paperclip2 size="16" color={iconColor} variant="Linear" />
          {project.attachments?.length ?? 0}
        </span>

        <span className="flex items-center gap-1 font-roboto text-sm tracking-0.1 text-gray-600">
          <TickSquare size="16" color={iconColor} variant="Linear" />
          {`${project.tasks_done?.length ?? 0}/${project.tasks?.length ?? 0}`}
        </span>

        {project.status !== "done" && (
          <span
            className={`flex items-center gap-1 rounded-md ${bgColor} ${textColor} px-1.5 py-1 font-roboto text-sm tracking-0.1`}
          >
            <Clock size="16" />
            {`${Math.abs(daysLeft)} ${deadlineText}`}
          </span>
        )}
      </div>

      <div className="mt-6">
        <ProgressBar
          totalTasks={project.tasks?.length ?? 0}
          completedTasks={project.tasks_done?.length ?? 0}
          progressPercentagePosition="absolute bottom-1.5 right-0"
          height="h-1"
        />
      </div>

      <div className="mt-2 flex items-center gap-2.5">
        {teamMembers?.slice(0, 5).map((memberId) => {
          const user = users?.data?.find(
            (user) => String(user.id) === memberId,
          );
          return (
            <img
              key={user?.id}
              src={user?.avatar_url || placeholderAvatar}
              alt={user?.name!}
              onError={(e) => addDefaultSrc(e, "avatar")}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover object-center"
            />
          );
        })}
        {teamMembers && teamMembers.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300">
            <span className="mr-px mt-px select-none text-xs text-gray-700">
              +{teamMembers.length - 5}
            </span>
          </div>
        )}
      </div>

      {fullHeight ? (
        <>
          <div className="mb-auto mt-4 flex gap-1">
            <span>
              <TextalignLeft size="16" className="text-gray-600" />
            </span>
            <div className="flex flex-col gap-1 overflow-hidden whitespace-normal">
              <h3 className="font-roboto text-sm/4 tracking-0.1 text-gray-800">
                Description
              </h3>
              <p className="max-w-80 truncate font-roboto text-sm tracking-0.1 text-gray-700">
                {projectDescription}
              </p>
            </div>
          </div>

          {project.tags!.length > 0 && (
            <div className="mt-2 flex max-h-[2.125rem] flex-wrap items-center gap-2 overflow-hidden">
              {project.tags!.map((tag, index) => (
                <span
                  key={index}
                  className="relative flex max-w-48 cursor-default items-center justify-center truncate rounded-full border border-primary-100 bg-primary-50 px-3 py-2 text-xs font-medium tracking-0.1 text-primary-800"
                >
                  {tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default ProjectCard;
