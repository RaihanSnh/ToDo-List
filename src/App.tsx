import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, useColorMode,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import {AiFillEdit, AiOutlinePlus, BsCheck2, BsFillMoonFill, BsTrashFill, MdCancel} from "react-icons/all";
import {ChangeEvent, useEffect, useRef, useState} from "react";

function App() {
    const [todos, _setTodos] = useState<TodoEntry[]>([]);
    const [_nextId, setNextId] = useState<number>(0);

    useEffect(() => {
        const todos = localStorage.getItem("todos_list");
        if (todos === null) {
            return;
        }
        _setTodos(JSON.parse(todos));

        const nextId = localStorage.getItem("todo_next_id");
        if (nextId === null) {
            return;
        }
        setNextId(parseInt(nextId));
    });

    const setTodos = (todos: TodoEntry[]) => {
        localStorage.setItem("todos_list", JSON.stringify(todos));
        _setTodos(todos);
    }

    const nextId = () => {
        const v = _nextId + 1;
        localStorage.setItem("todo_next_id", v.toString());
        setNextId(_nextId + 1);
        return v;
    }

    const {isOpen, onOpen, onClose} = useDisclosure();

    const createInputRef = useRef(null);

    const handleCreate = () => {
        const createInput = createInputRef.current;
        if (createInput === undefined || createInput === null) {
            return;
        }
        // @ts-ignore
        const text = createInput.value;
        if (text === "") {
            return;
        }

        todos.push({
            id: nextId(),
            text: text,
            success: false,
            createdAt: new Date()
        });
        setTodos(todos);
        onClose();
    }

    const {toggleColorMode } = useColorMode()

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>
                        Tugas Baru
                        <ModalCloseButton/>
                    </ModalHeader>
                    <ModalBody pb={8}>
                        <Box mb={6}>
                            <Input type={"text"} placeholder={"Deskripsikan tugas"} ref={createInputRef}/>
                        </Box>
                        <Button w={"full"} colorScheme={"blue"} onClick={handleCreate}>
                            Buat
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Box px={4} py={2} mb={2}>
                <Heading textAlign={"center"}>Todo List</Heading>
            </Box>
            <Flex justifyContent={"right"} mb={4} px={2} gap={2}>
                <Button colorScheme={"blue"} size={"sm"}
                        onClick={toggleColorMode}>
                    <Icon as={BsFillMoonFill} w={5} h={5}/>
                </Button>
                <Button colorScheme={"blue"} size={"sm"} leftIcon={<Icon as={AiOutlinePlus} w={5} h={5}/>}
                        onClick={onOpen}>
                    Tambahkan
                </Button>
            </Flex>
            <Box px={2}>
                <Flex gap={2} flexDirection={"column"}>
                    {todos.map((a, b) => {
                        return <Todo key={b} id={b} todo={a} setTodos={setTodos} todos={todos}/>
                    })}
                    {todos.length === 0 && <Box textAlign={"center"} fontSize={"2xl"}>Tidak ada tugas</Box>}
                </Flex>
            </Box>
        </Box>
    );
}

interface TodoEntry {
    id: number
    text: string
    success: boolean
    createdAt: Date
}

interface TodoProps {
    id: number
    todo: TodoEntry
    todos: TodoEntry[]
    setTodos: any
}

function Todo(props: TodoProps) {
    const toast = useToast();

    const isMobile = window.innerWidth <= 768;

    const [checked, setChecked] = useState(props.todo.success);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            toast({
                description: <Box>Tugas <Box as={"span"} fontWeight={"bold"}>{props.todo.text}</Box> telah ditandai
                    selesai</Box>,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: isMobile ? "bottom" : "top-right",
            })
        }

        const todos = props.todos;
        todos[todos.indexOf(props.todo)].success = e.target.checked;
        props.setTodos(todos);
        setChecked(e.target.checked);
    }

    const onDelete = () => {
        const todos = props.todos;
        const newTodos: TodoEntry[] = [];
        todos.forEach((t) => {
            if (t.id !== props.todo.id) {
                newTodos.push(t)
            }
        });
        props.setTodos(newTodos)
        toast({
            description: <Box>Tugas <Box as={"span"} fontWeight={"bold"}>{props.todo.text}</Box> telah dihapus</Box>,
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: isMobile ? "bottom" : "top-right",
        })
    }

    const editInputRef = useRef(null);

    const onEdit = () => {
        const editInput = editInputRef.current;
        if (editInput === undefined || editInput === null) {
            return;
        }
        // @ts-ignore
        const text = editInput.value;
        if (text === "") {
            return;
        }
        const todos = props.todos;
        todos[props.id].text = text;
        props.setTodos(todos);
        setIsEditing(false);
    }

    const [isEditing, setIsEditing] = useState(false);

    return (
        <>
            <Flex rounded={"lg"} px={4} py={2} border={"1px"} borderColor={"gray.800"} _dark={{borderColor: "gray.50"}} alignItems={"center"} gap={1}>
                <Checkbox onChange={onChange} isChecked={checked} mx={1}/>
                <Box flex={"auto"} fontWeight={"semibold"} fontSize={"lg"}>
                    {!isEditing && <Box wordBreak={"break-all"}>{props.todo.text}</Box>}
                    {isEditing && <Input type={"text"} size={"sm"} fontSize={"lg"} fontWeight={"semibold"} rounded={"xl"} defaultValue={props.todo.text} ref={editInputRef}/>}
                </Box>
                {!isEditing &&
                    <>
                        <Button size={"sm"} colorScheme={"red"} onClick={onDelete}>
                            <Icon as={BsTrashFill} w={5} h={5} color={"white"}/>
                        </Button>
                        <Button size={"sm"} colorScheme={"green"} onClick={() => setIsEditing(true)}>
                            <Icon as={AiFillEdit} w={5} h={5} color={"white"}/>
                        </Button>
                    </>
                }
                {isEditing &&
                    <>
                        <Button size={"sm"} colorScheme={"green"} onClick={onEdit}>
                            <Icon as={BsCheck2} w={5} h={5} color={"white"}/>
                        </Button>

                        <Button size={"sm"} colorScheme={"red"} onClick={() => setIsEditing(false)}>
                            <Icon as={MdCancel} w={5} h={5} color={"white"}/>
                        </Button>
                    </>}
            </Flex>
        </>
    );
}

export default App
